import {encode} from 'bs58'
import {createHash, randomBytes} from 'crypto'

export const generateDocumentId = (): string => encode(randomBytes(8))

export const documentIdPattern = '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{11}'

export const isDefined = (variable: any): boolean => typeof variable !== 'undefined'

export const digest = (value: string): string => createHash('sha256').update(value).digest('hex')
