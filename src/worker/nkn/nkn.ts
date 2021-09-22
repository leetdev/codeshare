import {MultiClient, Wallet} from 'nkn-sdk'
import {NetworkProvider} from '~common/types/rpc/network'
import {Data} from '~worker/database'
import {rpcServerAddr, tls} from './config'

const SEED_KEY = 'seed'

export class NKN implements NetworkProvider {
  private wallet?: Wallet
  private client?: MultiClient
  private identifier?: string

  async getSubscribersCount(topic: string): Promise<number> {
    const client = await this.getClient()
    return await client.getSubscribersCount(getTopic(topic))
  }

  private whenConnected(then: Function): Promise<any> {
    return new Promise(resolve => {
      if (this.client?.isReady) {
        resolve(then())
      } else {
        this.client?.onConnect(() => resolve(then()))
      }
    })
  }

  private async getClient(): Promise<MultiClient> {
    if (!this.client) {
      this.client = new MultiClient({
        seed: await this.getSeed(),
        identifier: this.identifier,
        originalClient: true,
        rpcServerAddr,
        worker: false,
        responseTimeout: 0,
        tls,
      })
      await this.maybeSaveSeed()
    }
    return this.client
  }

  private async getSeed(): Promise<string | undefined> {
    if (this.wallet) {
      return this.wallet.getSeed()
    }
    return await Data.get(SEED_KEY) || undefined
  }

  private async maybeSaveSeed(): Promise<void> {
    if (!this.wallet) {
      await Data.set(SEED_KEY, this.client?.getSeed())
      console.log('saving seed: ' + this.client?.getSeed())
    }
  }
}

const getTopic = (id: string): string => `codeshare_${id}`
