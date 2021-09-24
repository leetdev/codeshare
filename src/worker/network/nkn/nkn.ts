import {hash, MultiClient, Wallet} from 'nkn-sdk'
import {NetworkProvider} from '~common/types/rpc/network'
import {Data} from '~worker/storage/database'
import {resubThreshold, rpcServerAddr, subscribeDuration, tls} from './config'

const SEED_KEY = 'seed'

export class NKN implements NetworkProvider {
  private wallet?: Wallet
  private client?: MultiClient
  private identifier?: string

  async getSubscribersCount(topic: string): Promise<number> {
    const client = await this.getClient()
    return await client.getSubscribersCount(getTopic(topic))
  }

  async subscribe(topic: string): Promise<string> {
    const client = await this.getClient()
    return await client.subscribe(getTopic(topic), subscribeDuration, client.identifier) as string
  }

  async isSubscribed(topic: string): Promise<boolean> {
    const client = await this.getClient()
    const {height} = await client.getLatestBlock()
    const {expiresAt} = await client.getSubscription(getTopic(topic), client.addr)

    return !!expiresAt && expiresAt - resubThreshold > height
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
    }
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
}

const getTopic = (id: string): string => `codeshare_${hash.sha256(id)}`
