import {encode} from 'bs58'
import {createHash, randomBytes} from 'crypto'
import {SessionId} from '~common/types/protocol'

export const documentIdPattern = '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{11}'

export const digest = (value: string): string => createHash('sha256').update(value).digest('hex')

export const generateDocumentId = (): string => encode(randomBytes(8))

export const generateSessionId = (): SessionId => randomBytes(32).toString('hex')

export const isDefined = (variable: any): boolean => typeof variable !== 'undefined'
