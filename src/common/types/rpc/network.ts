import type {Document} from './storage'

export interface HandlerFunction<MessageType> {
  (message: MessageType, clientAddr: string): Promise<void>
}

export interface NetworkProvider {
  clientAddr: string

  getSubscribers(topic: string): Promise<Array<string>>
  getSubscribersCount(topic: string): Promise<number>
  isSubscribed(topic: string): Promise<boolean>
  onMessage<MessageType>(handler: HandlerFunction<MessageType>, includeOwn?: boolean): void
  publish(topic: string, data: any): Promise<void>
  send(to: string, data: any): Promise<void>
  subscribe(topic: string): Promise<string>
}

export interface NetworkManager {
  netDocumentCreate(): Promise<Document>
  netDocumentStartSession(id: string): Promise<Document>
}
