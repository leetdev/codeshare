import {Update} from '@codemirror/collab'
import {ChangeSet, Text} from '@codemirror/state'
import {
  AuthorityGetDocumentResponse,
  AuthorityManager,
  AuthorityPullUpdatesResponse, AuthorityPushUpdatesResponse,
  DocumentUpdate,
  SessionId,
} from '~common/types/protocol'
import {NetworkProvider} from '~common/types/rpc/network'
import {Session} from '~worker/network/session'

export class Authority implements AuthorityManager {
  private current: SessionId

  private document?: Text
  private version: number = 0
  private updates: Map<number, Update> = new Map()
  private pending: ((response: AuthorityPullUpdatesResponse) => void)[] = []

  constructor(
    private readonly networkProvider: NetworkProvider,
    private readonly session: Session,
  ) {
    this.current = session.id
  }

  async getDocument(): Promise<AuthorityGetDocumentResponse> {
    return this.onGetDocument()
  }

  isSelf(): boolean {
    return this.current === this.session.id
  }

  async pullUpdates(version: number): Promise<AuthorityPullUpdatesResponse> {
    const updates = await this.onPullUpdates(version) // TODO: remote

    let text = Text.of(this.session.documentContent.split('\n'))
    console.log(text, updates)
    updates.forEach(update => text = ChangeSet.fromJSON(update.changes).apply(text))

    this.session.updateDocument(text.toString(), version)

    return updates
  }

  async pushUpdates(version: number, updates: DocumentUpdate[]): Promise<AuthorityPushUpdatesResponse> {
    return this.onPushUpdates(version, updates) // TODO: remote
  }

  transfer(id: SessionId, document?: string, version?: number): void {
    this.current = id
    this.document = Text.of(document?.split('\n') || [''])
    this.version = version || 0
    this.updates = new Map()

    while (this.pending.length) {
      this.pending.pop()!([])
    }

    if (this.isSelf()) {
      // TODO: register listeners
    } else {
      // TODO: establish session && get document
    }
  }

  private onGetDocument(): AuthorityGetDocumentResponse {
    return {
      document: this.document?.toString() || '',
      version: this.version,
    }
  }

  private onPullUpdates(version: number): Promise<AuthorityPullUpdatesResponse> {
    return new Promise<AuthorityPullUpdatesResponse>(resolve => {
      if (version < this.version) {
        const slice: DocumentUpdate[] = []

        for (let i = version + 1; i <= this.version; i++) {
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

  private onPushUpdates(version: number, updates: DocumentUpdate[]): AuthorityPushUpdatesResponse {
    if (version !== this.version) {
      return false
    } else {
      for (let update of updates) {
        let changes = ChangeSet.fromJSON(update.changes)

        this.updates.set(++this.version, {changes, clientID: update.clientID})

        this.document = changes.apply(this.document as Text)
      }

      while (this.pending.length) {
        console.log('Popping: ', updates)
        this.pending.pop()!(updates)
      }

      return true
    }
  }
}
