import {encode} from 'bs58'
import {randomBytes} from 'crypto'

export const generateDocumentId = (): string => encode(randomBytes(8))

export const documentIdPattern = '[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{11}'
