import {MultiClient, Wallet} from 'nkn-sdk'

export class NKN {
  private _client?: MultiClient

  connect(options = {}, wallet?: Wallet): void {
    this._client = new MultiClient({
      ...options,
    })
  }

  private _createWorker = () => new Worker(new URL('nkn-sdk/lib/worker/webpack.worker', import.meta.url))
}
