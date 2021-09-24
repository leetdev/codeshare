import type {Document} from './storage'

export interface NetworkProvider {
  getSubscribersCount(topic: string): Promise<number>
  isSubscribed(topic: string): Promise<boolean>
  subscribe(topic: string): Promise<string>
}

export interface NetworkManager {
  netDocumentCreate(): Promise<Document>
  netDocumentStartSession(id: string): Promise<Document>
}
