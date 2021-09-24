import {NetworkProvider} from '~common/types/rpc/network'
import {Document} from '~worker/storage/database'

export class Connection {
  document: Document
  provider: NetworkProvider

  constructor(document: Document, provider: NetworkProvider) {
    this.document = document
    this.provider = provider

    this.init().then()
  }

  private async init() {
    await this.maybeRenewSubscription()
  }

  private async maybeRenewSubscription() {
    if (! await this.provider.isSubscribed(this.document.id)) {
      await this.provider.subscribe(this.document.id)
    }
  }
}
