import {NetworkManager, NetworkProvider} from '~common/types/rpc/network'
import {generateDocumentId} from '~common/utils'
import {Document} from '~worker/database'

class Network implements NetworkManager {
  provider: NetworkProvider

  constructor(provider: NetworkProvider) {
    this.provider = provider
  }

  async createDocument(): Promise<Document> {
    let id, isValid
    do {
      id = generateDocumentId()
      isValid = ! await this.provider.getSubscribersCount(id)
    } while (!isValid)

    return await Document.create(id)
  }
}

export default Network
