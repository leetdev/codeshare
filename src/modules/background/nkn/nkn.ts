import {MultiClient, Wallet} from 'nkn-sdk'
import {generateDocumentId} from '../../../utils'
import {Data, Document} from '../../database'
import {rpcServerAddr, tls} from './config'

const SEED_KEY = 'seed'

export class NKN {
  private wallet?: Wallet
  private client?: MultiClient
  private identifier?: string

  async createDocument(): Promise<Document> {
    const client = await this.getClient()

    let id, isValid
    do {
      id = generateDocumentId()
      isValid = ! await client.getSubscribersCount(getTopic(id))
    } while (!isValid)

    return await Document.create(id)
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
