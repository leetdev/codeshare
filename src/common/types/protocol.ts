export type SessionId = string

export interface Message<Type = {}> {
  action: string
  hash?: string
  payload: Payload<Type>
  sessionId: SessionId
  to?: SessionId
}

export interface DocumentMessage<Type = {}> extends Message<Type> {
  documentId: string
}

export interface BasePayload {
  timestamp?: number
}

export type Payload<MessageType = {}> = BasePayload & MessageType

export interface MessageHandler<MessageType> {
  (payload: Payload<MessageType>, sessionId: SessionId, clientAddr: string): Promise<void>
}

export interface JoinMessage {
  documentVersion: number
}

export interface WelcomeMessage {
  authority: boolean
  documentVersion: number
}

export interface AuthorityManager {
  getDocument(): Promise<AuthorityGetDocumentResponse>
  isSelf(): boolean
  pullUpdates(version: number): Promise<AuthorityPullUpdatesResponse>
  pushUpdates(version: number, updates: DocumentUpdate[]): Promise<AuthorityPushUpdatesResponse>
  transfer(id: SessionId, document?: string, version?: number): void
}

export type AuthorityMessage<Type = {}> = {
  type: string
} & Type

export interface AuthorityGetDocument {
}

export interface AuthorityGetDocumentResponse {
  version: number
  document: string
}

export interface AuthorityPullUpdates {
  version: number
}

export interface DocumentUpdate {
  changes: string
  clientID: string
}

export type AuthorityPullUpdatesResponse = DocumentUpdate[]

export interface AuthorityPushUpdates {
  version: number
  updates: DocumentUpdate[]
}

export type AuthorityPushUpdatesResponse = boolean
