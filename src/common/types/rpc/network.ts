import {Document} from '~common/types/rpc/storage'
import {DocumentUpdate} from '~common/types/protocol'

export interface DirectSession {
  receive(handler: DirectSessionMessageHandlerFunction): void
  send(message: any): Promise<void>
}

export interface DirectSessionHandlerFunction {
  (session: DirectSession): void
}

export interface DirectSessionMessageHandlerFunction {
  (message: any): void | Promise<void>
}

export interface MessageHandlerFunction<MessageType> {
  (message: MessageType, clientAddr: string): Promise<void>
}

export interface NetworkCalls {
  netDocumentCreate(): Promise<Document>
  netDocumentPullUpdates(id: string, version: number, callback: (updates: DocumentUpdate[]) => void): Promise<void>
  netDocumentPushUpdates(id: string, version: number, updates: DocumentUpdate[]): Promise<void>
  netDocumentStartSession(id: string): Promise<Document>
}

export interface NetworkProvider {
  clientAddr: string

  dial(addr: string): Promise<DirectSession>
  getSubscribers(topic: string): Promise<Array<string>>
  getSubscribersCount(topic: string): Promise<number>
  isSubscribed(topic: string): Promise<boolean>
  onSession(handler: DirectSessionHandlerFunction): void
  onMessage<MessageType>(handler: MessageHandlerFunction<MessageType>, includeOwn?: boolean): void
  publish(topic: string, data: any): Promise<void>
  send(to: string, data: any): Promise<void>
  subscribe(topic: string): Promise<string>
}
