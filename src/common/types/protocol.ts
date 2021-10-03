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

export type Payload<MessageType> = {
  timestamp?: number
} & MessageType

export type MessageHandler<MessageType> = (payload: Payload<MessageType>, sessionId: SessionId, clientAddr: string) => Promise<void>

export interface JoinMessage {
  documentVersion: number
}

export interface NextInLineMessage {
  id: SessionId | null
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
  transfer(id: SessionId, addr?: string): void
}

export type AuthorityMessage<Type = {}> = {
  id: string
  replyTo?: string
  type: string
  payload: Type
}

export interface AuthorityGetDocument {
  sessionId: SessionId
}

export interface DocumentData {
  content: string
  language: number
  tabSize: number
  title: string
  version: number
}

export type AuthorityGetDocumentResponse = DocumentData

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
