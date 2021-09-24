import {NetworkManager, NetworkProvider} from '~common/types/rpc/network'
import {generateDocumentId} from '~common/utils'
import {Document} from '~worker/storage/database'
import {Connection} from './connection'

type Connections = {
  [id: string]: Connection
}

class Network implements NetworkManager {
  connections: Connections = {}
  provider: NetworkProvider

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

  async netDocumentStartSession(id: string): Promise<Document> {
    const document = await Document.findOrCreate(id)

    this.connections[id] = new Connection(document, this.provider)

    return document
  }
}

export default Network
