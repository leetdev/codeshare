import {MultiClient, Wallet} from 'nkn-sdk'
import {
  DirectSession,
  DirectSessionCloseHandlerFunction,
  DirectSessionHandlerFunction,
  MessageHandlerFunction,
  NetworkProvider,
} from '~common/types/rpc/network'
import {digest} from '~common/utils'
import {Session} from '~worker/network/nkn/session'
import {Data} from '~worker/storage/database'
import {resubThreshold, rpcServerAddr, subscribeDuration} from './config'

const SEED_KEY = 'seed'

export class NKN implements NetworkProvider {
  clientAddr: string = ''

  private wallet?: Wallet
  private _client?: MultiClient
  private identifier?: string
  private seed?: string
  private isReady: boolean = false

  constructor() {
    Data.get(SEED_KEY).then(seed => this.seed = seed)
  }

  async dial(addr: string, onClose?: DirectSessionCloseHandlerFunction): Promise<DirectSession> {
    const session = await this.client.dial(addr)

    return new Session(session, onClose)
  }

  async getSubscribers(topic: string): Promise<Array<string>> {
    const {subscribers, subscribersInTxPool} = await this.client.getSubscribers(getTopic(topic), {
      txPool: true,
    })
    return (subscribers as string[]).concat(subscribersInTxPool as string[] || [])
  }

  async getSubscribersCount(topic: string): Promise<number> {
    return await this.client.getSubscribersCount(getTopic(topic))
  }

  async isSubscribed(topic: string): Promise<boolean> {
    const {height} = await this.client.getLatestBlock()
    const {expiresAt} = await this.client.getSubscription(getTopic(topic), this.client.addr)

    return !!expiresAt && expiresAt - resubThreshold > height
  }

  onMessage<MessageType>(handler: MessageHandlerFunction<MessageType>, includeOwn = false) {
    this.client.onMessage(async (message) => {
      console.log({
        ...message,
        payload: JSON.parse(message.payload as string),
      })
      if (includeOwn || message.src !== this.clientAddr) {
        await handler(JSON.parse(message.payload as string), message.src)
      }
    })
  }

  onSession(handler: DirectSessionHandlerFunction, onClose?: DirectSessionCloseHandlerFunction) {
    this.client.onSession(session => handler(new Session(session, onClose)))
  }

  async publish(topic: string, data: any): Promise<void> {
    await this.untilReady()
    await this.client.publish(getTopic(topic), JSON.stringify(data), {
      txPool: true,
    })
  }

  async send(to: string, data: any): Promise<void> {
    await this.untilReady()
    await this.client.send(to, JSON.stringify(data))
  }

  startListening(): void {
    this.client.listen()
  }

  setIdentifier(identifier: string) {
    this.identifier = identifier
  }

  stopListening(): void {
    this.client.listen([])
  }

  async subscribe(topic: string): Promise<string> {
    return await this.client.subscribe(getTopic(topic), subscribeDuration, this.client.identifier) as string
  }

  private get client(): MultiClient {
    if (!this._client) {
      this._client = new MultiClient({
        //seed: this.getSeed(),
        identifier: this.identifier,
        originalClient: true,
        rpcServerAddr: rpcServerAddr(),
        worker: false,
        responseTimeout: 0,
        tls: false,
      })

      this._client.onConnect(() => this.isReady = true)

      this.clientAddr = this._client.addr

      this.maybeSaveSeed().then()
    }
    return this._client
  }

  private getSeed(): string | undefined {
    if (this.wallet) {
      return this.wallet.getSeed()
    }
    return this.seed
  }

  private async maybeSaveSeed(): Promise<void> {
    if (!this.wallet) {
      await Data.set(SEED_KEY, this.client.getSeed())
    }
  }

  private untilReady(): Promise<void> {
    return new Promise(resolve => {
      if (this.isReady) {
        resolve()
      } else {
        this.client.onConnect(() => resolve())
      }
    })
  }
}

const getTopic = (id: string): string => digest(`codeshare_${id}`)
