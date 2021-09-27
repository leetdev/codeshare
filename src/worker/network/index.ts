import {DocumentUpdate} from '~common/types/protocol'
import {NetworkManager, NetworkProvider} from '~common/types/rpc/network'
import {generateDocumentId} from '~common/utils'
import {Document} from '~worker/storage/database'
import {Session} from './session'

class Network implements NetworkManager {
  private readonly provider: NetworkProvider
  private sessions = new Map<string, Session>()

  constructor(provider: NetworkProvider) {
    this.provider = provider
  }

  async netDocumentCreate(): Promise<Document> {
    let id, isValid
    do {
      id = generateDocumentId()
      isValid = ! await this.provider.getSubscribersCount(id)
    } while (!isValid)

    return await Document.create(id)
  }

  async netDocumentPullUpdates(id: string, version: number, callback: (updates: DocumentUpdate[]) => void): Promise<void> {
    const session = this.sessions.get(id) as Session // TODO: error handling
    const updates = await session.authority.pullUpdates(version)

    callback(updates)
  }

  async netDocumentPushUpdates(id: string, version: number, updates: DocumentUpdate[]): Promise<void> {
    const session = this.sessions.get(id) as Session // TODO: error handling

    await session.authority.pushUpdates(version, updates)
  }

  async netDocumentStartSession(id: string): Promise<Document> {
    const document = await Document.findOrCreate(id)

    this.sessions.set(id, new Session(document, this.provider))

    return document
  }
}

export default Network
