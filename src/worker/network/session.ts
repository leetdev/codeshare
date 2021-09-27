import {NetworkProvider} from '~common/types/rpc/network'
import {digest, generateSessionId} from '~common/utils'
import {
  DocumentMessage,
  JoinMessage,
  MessageHandler,
  Payload,
  SessionId,
  WelcomeMessage,
} from '~common/types/protocol'
import {Authority} from '~worker/network/authority'
import {Document} from '~worker/storage/database'

export class Session {
  readonly id: SessionId
  readonly authority: Authority

  private handlers: Map<string, MessageHandler<any>>
  private subscribers: string[] = []
  private sessions: Map<SessionId, string> = new Map()

  constructor(
    private readonly document: Document,
    private readonly provider: NetworkProvider,
  ) {
    this.id = generateSessionId()
    this.authority = new Authority(this.provider, this)
    this.authority.transfer(this.id, document.content, document.version)

    this.init().then()

    this.handlers = new Map([

      ['join', async function (this: Session, {documentVersion}: Payload<JoinMessage>, sessionId, clientAddr) {
        console.log(`${sessionId}: [JOIN] ${documentVersion}`, this)

        this.sessions.set(sessionId, clientAddr)

        await this.postMessage.bind(this)<WelcomeMessage>('welcome', {
          authority: this.isAuthority,
          documentVersion: this.document.version,
        }, sessionId)
      }],

      ['welcome', async function (this: Session, {authority, documentVersion}: Payload<WelcomeMessage>, sessionId, clientAddr) {
        console.log(`${sessionId}: [WELCOME] ${documentVersion}`)

        this.sessions.set(sessionId, clientAddr)

        if (authority) {
          this.authority.transfer(sessionId)
        }
      }],

    ])
  }

  get documentContent(): string {
    return this.document.content
  }

  updateDocument(content: string, version: number) {
    this.document.content = content
    this.document.version = version
  }

  private async init() {
    // Register incoming message handler
    this.provider.onMessage<DocumentMessage>(this.onMessage.bind(this), true)

    // Subscribe to the topic
    await this.maybeRenewSubscription()

    // Join session
    await this.join()

    // Cache subscriber addresses
    this.subscribers = await this.provider.getSubscribers(this.document.id)
    if (!this.subscribers.includes(this.provider.clientAddr)) {
      this.subscribers.push(this.provider.clientAddr)
    }
  }

  private async maybeRenewSubscription() {
    if (!await this.provider.isSubscribed(this.document.id)) {
      await this.provider.subscribe(this.document.id)
    }
  }

  private async join(): Promise<void> {
    await this.postMessage<JoinMessage>('join', {
      documentVersion: this.document.version,
    })
  }

  private get isAuthority(): boolean {
    return this.authority.isSelf()
  }

  // HANDLE INCOMING MESSAGES
  private async onMessage({
    action,
    documentId,
    payload,
    sessionId,
  }: DocumentMessage, clientAddr: string): Promise<void> {
    if (documentId === this.document.id && sessionId !== this.id) {
      const handler = this.handlers.get(action)
      if (!handler) {
        throw Error(`No handler for action '${action}'`)
      } else {
        await handler.call(this, payload, sessionId, clientAddr)
      }
    }
  }

  // POST OUTGOING MESSAGE TO TOPIC OR PARTICULAR RECIPIENT SESSION
  private async postMessage<MessageType>(action: string, payload: Payload<MessageType>, sendTo?: SessionId): Promise<void> {
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
      sessionId: this.id,
    }

    if (sendTo) {
      message.to = sendTo

      console.log(`POST TO ${sendTo}:`, message)
      if (this.sessions.has(sendTo)) {
        await this.provider.send(this.sessions.get(sendTo) as string, message)
      } else {
        throw new Error(`Session ${sendTo} not registered!`)
      }
    } else {
      console.log('POST:', message)
      await this.provider.publish(this.document.id, message)
    }
  }
}
