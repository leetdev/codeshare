import type {Document} from '~common/types/rpc/database'

export interface NetworkProvider {
  getSubscribersCount(topic: string): Promise<number>
}

export interface NetworkManager {
  createDocument(): Promise<Document>
}
