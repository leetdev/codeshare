import {Document} from '~common/types/rpc/storage'
import {DocumentData, DocumentUpdate} from '~common/types/protocol'

export interface DirectSession {
  receive(handler: DirectSessionMessageHandlerFunction): void
  send(message: any): Promise<void>
  close(): Promise<void>
}

export type DirectSessionHandlerFunction = (session: DirectSession) => void

export type DirectSessionMessageHandlerFunction = (message: any) => void | Promise<void>

export type DirectSessionCloseHandlerFunction = (session: DirectSession) => void

export type MessageHandlerFunction<MessageType> = (message: MessageType, clientAddr: string) => Promise<void>

export type GetDocumentCallback = (document: DocumentData) => void

export interface NetworkCalls {
  netDocumentCreate(): Promise<Document>
  netDocumentPullUpdates(id: string, version: number, callback: (updates: DocumentUpdate[]) => void): Promise<void>
  netDocumentPushUpdates(id: string, version: number, updates: DocumentUpdate[]): Promise<void>
  netDocumentStartSession(id: string, onGetDocument: GetDocumentCallback): Promise<Document>
}

export interface NetworkProvider {
  clientAddr: string

  dial(addr: string, onClose?: DirectSessionCloseHandlerFunction): Promise<DirectSession>
  getSubscribers(topic: string): Promise<Array<string>>
  getSubscribersCount(topic: string): Promise<number>
  isSubscribed(topic: string): Promise<boolean>
  onSession(handler: DirectSessionHandlerFunction, onClose?: DirectSessionCloseHandlerFunction): void
  onMessage<MessageType>(handler: MessageHandlerFunction<MessageType>, includeOwn?: boolean): void
  publish(topic: string, data: any): Promise<void>
  send(to: string, data: any): Promise<void>
  startListening(): void
  setIdentifier(identifier: string): void
  stopListening(): void
  subscribe(topic: string): Promise<string>
}
