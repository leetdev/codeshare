import {NetworkProvider} from '~common/types/rpc/network'
import {digest} from '~common/utils'
import {DocumentMessage, JoinMessage, MessageHandler, Payload} from '~worker/network/protocol'
import {Document} from '~worker/storage/database'

export class Session {
  document: Document
  provider: NetworkProvider
  handlers: Map<string, MessageHandler<any>>

  constructor(document: Document, provider: NetworkProvider) {
    this.document = document
    this.provider = provider
    this.handlers = new Map()

    this.initHandlers()
    this.provider.onMessage<DocumentMessage>(this.onMessage.bind(this), false)
    this.initSession().then()
  }

  private initHandlers() {
    this.handlers.set('join', async function ({documentVersion}: Payload<JoinMessage>, clientAddr) {
      console.log(`${clientAddr}: [JOIN] ${documentVersion}`)
    })
  }

  private async initSession() {
    await this.maybeRenewSubscription()
    await this.join()
  }

  private async maybeRenewSubscription() {
    if (! await this.provider.isSubscribed(this.document.id)) {
      await this.provider.subscribe(this.document.id)
    }
  }

  private async join(): Promise<void> {
    await this.postMessage<JoinMessage>('join', {
      documentVersion: 0,
    })
  }

  private async onMessage({action, documentId, payload}: DocumentMessage, clientAddr: string): Promise<void> {
    if (documentId === this.document.id) {
      const handler = this.handlers.get(action)
      if (!handler) {
        throw Error(`No handler for action '${action}'`)
      } else {
        await handler.call(this, payload, clientAddr)
      }
    }
  }

  private async postMessage<MessageType>(action: string, payload: Payload<MessageType>): Promise<void> {
    const fullPayload = {
      ...payload,
      timestamp: Date.now(),
    }
    const hash = digest(JSON.stringify(fullPayload))
    const message: DocumentMessage<MessageType> = {
      action,
      documentId: this.document.id,
      hash,
      payload: fullPayload,
    }

    await this.provider.publish(this.document.id, message)
  }
}
