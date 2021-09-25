export interface Message<Type = {}> {
  action: string
  hash?: string
  payload: Payload<Type>
}

export interface DocumentMessage<Type = {}> extends Message<Type> {
  documentId: string
}

export interface BasePayload {
  timestamp?: number
}

export type Payload<MessageType = {}> = BasePayload & MessageType

export interface MessageHandler<MessageType> {
  (payload: Payload<MessageType>, clientAddr: string): Promise<void>
}

export interface JoinMessage {
  documentVersion: number
}
