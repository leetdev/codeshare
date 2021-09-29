import {Update} from '@codemirror/collab'
import {ChangeSet, Text} from '@codemirror/state'
import {
  AuthorityGetDocument,
  AuthorityGetDocumentResponse,
  AuthorityManager,
  AuthorityMessage,
  AuthorityPullUpdates,
  AuthorityPullUpdatesResponse,
  AuthorityPushUpdates,
  AuthorityPushUpdatesResponse,
  DocumentData,
  DocumentUpdate,
  SessionId,
} from '~common/types/protocol'
import {DirectSession, GetDocumentCallback, NetworkProvider} from '~common/types/rpc/network'
import {generateMessageId} from '~common/utils'
import {Session} from '~worker/network/session'

export class Authority implements AuthorityManager {
  private current: SessionId

  private documentText: Text
  private updates: Map<number, Update> = new Map()
  private pending: ((response: AuthorityPullUpdatesResponse) => void)[] = []

  private outSession?: DirectSession
  private inSessions: DirectSession[] = []
  private replyQueue = new Map<string, [Function, Function]>()

  constructor(
    private readonly networkProvider: NetworkProvider,
    private readonly session: Session,
    private onGetDocument: GetDocumentCallback,
    private document: DocumentData,
  ) {
    this.current = session.id
    this.documentText = Text.of(document.content.split('\n'))

    this.networkProvider.onSession(session => {
      console.log('Session incoming:', session, this)
      if (this.isSelf()) {
        session.receive(message => this.handleIncomingMessage.call(this, message as AuthorityMessage, session))

        this.inSessions.push(session)

        return
      }

      session.close().then()
    })
  }

  async getDocument(): Promise<AuthorityGetDocumentResponse> {
    if (this.isSelf() || !this.outSession) {
      return this.selfGetDocument()
    }

    const response = await this.sendAuthorityMessage<AuthorityGetDocument, AuthorityGetDocumentResponse>(
      'getDocument',
      {},
      this.outSession,
    )

    this.onGetDocument(response)

    return response
  }

  isSelf(): boolean {
    return this.current === this.session.id
  }

  async pullUpdates(version: number): Promise<AuthorityPullUpdatesResponse> {
    let updates
    if (this.isSelf() || !this.outSession) {
      updates = await this.selfPullUpdates(version)
    } else {
      updates = await this.sendAuthorityMessage<AuthorityPullUpdates, AuthorityPullUpdatesResponse>(
        'pullUpdates',
        {version},
        this.outSession,
      )
    }
    let text = Text.of(this.session.documentContent.split('\n'))

    updates.forEach(update => text = ChangeSet.fromJSON(update.changes).apply(text))

    this.session.updateDocument(text.toString(), version)

    return updates
  }

  async pushUpdates(version: number, updates: DocumentUpdate[]): Promise<AuthorityPushUpdatesResponse> {
    if (this.isSelf() || !this.outSession) {
      return this.selfPushUpdates(version, updates)
    }

    return await this.sendAuthorityMessage<AuthorityPushUpdates, AuthorityPushUpdatesResponse>(
      'pushUpdates',
      {version, updates},
      this.outSession,
    )
  }

  transfer(id: SessionId, addr?: string): void {
    console.log('Authority transfer: ' + id)
    this.current = id
    this.updates = new Map()

    if (this.isSelf()) {
      // close incoming sessions
      while (this.inSessions.length) {
        this.inSessions.pop()!.close().then()
      }

      // register listeners
      this.networkProvider.startListening()
    } else {
      this.networkProvider.stopListening()

      // establish session & get document
      this.networkProvider.dial(addr as string).then(async session => {
        while (this.pending.length) {
          this.pending.pop()!([])
        }

        session.receive(message => this.handleIncomingMessage.call(this, message as AuthorityMessage, session))

        this.outSession = session

        this.document = await this.getDocument()
        this.documentText = Text.of(this.document.content.split('\n'))
      })
    }
  }

  private selfGetDocument(): AuthorityGetDocumentResponse {
    return this.document
  }

  private selfPullUpdates(version: number): Promise<AuthorityPullUpdatesResponse> {
    return new Promise<AuthorityPullUpdatesResponse>(resolve => {
      if (version < this.document.version && this.updates.has(version + 1)) {
        const slice: DocumentUpdate[] = []

        for (let i = version + 1; i <= this.document.version; i++) {
          let update = this.updates.get(i) as Update
          slice.push({
            changes: update.changes.toJSON(),
            clientID: update.clientID,
          })
        }

        resolve(slice)
      } else {
        this.pending.push(resolve)
      }
    })
  }

  private selfPushUpdates(version: number, updates: DocumentUpdate[]): AuthorityPushUpdatesResponse {
    if (version !== this.document.version) {
      return false
    } else {
      for (let update of updates) {
        let changes = ChangeSet.fromJSON(update.changes)

        this.updates.set(++this.document.version, {changes, clientID: update.clientID})

        this.documentText = changes.apply(this.documentText as Text)
        this.document.content = this.documentText.toString()
      }

      while (this.pending.length) {
        console.log('Popping: ', updates)
        this.pending.pop()!(updates)
      }

      return true
    }
  }

  private async handleIncomingMessage(message: AuthorityMessage, session: DirectSession): Promise<void> {
    if (this.isSelf()) {
      let payload

      switch (message.type) {
        case 'getDocument':
          return sendAuthorityReply<AuthorityGetDocumentResponse>('reply',
            this.selfGetDocument(),
            session,
            message.id,
          )

        case 'pullUpdates':
          payload = message.payload as AuthorityPullUpdates
          return sendAuthorityReply<AuthorityPullUpdatesResponse>('reply',
            await this.selfPullUpdates(payload.version),
            session,
            message.id,
          )

        case 'pushUpdates':
          payload = message.payload as AuthorityPushUpdates
          return sendAuthorityReply<AuthorityPushUpdatesResponse>('reply',
            await this.selfPushUpdates(payload.version, payload.updates),
            session,
            message.id,
          )

        default:
          throw new Error(`Invalid authority message type: ${message.type}`)
      }
    } else {
      if (message.type !== 'reply') {
        throw new Error(`Invalid authority message type: ${message.type}`)
      }

      if (!message.replyTo) {
        throw new Error(`Reply message without replyTo parameter received!`)
      }

      if (!this.replyQueue.has(message.replyTo)) {
        throw new Error(`No message with ID '${message.replyTo}' found in queue!`)
      }

      // TODO: reject on error
      const [resolve] = this.replyQueue.get(message.replyTo) as Array<Function>
      resolve(message.payload)

      this.replyQueue.delete(message.replyTo)
    }
  }

  private sendAuthorityMessage<MessageType, ReplyType>(type: string, message: MessageType, session: DirectSession): Promise<ReplyType> {
    const id = generateMessageId()

    return new Promise(async (resolve, reject) => {
      this.replyQueue.set(id, [resolve, reject])

      await session.send({
        id,
        type,
        payload: message,
      })
    })
  }
}

function sendAuthorityReply<MessageType>(type: string, message: MessageType, session: DirectSession, replyTo: string): Promise<void> {
  return session.send({
    id: generateMessageId(),
    type,
    replyTo,
    payload: message,
  })
}
