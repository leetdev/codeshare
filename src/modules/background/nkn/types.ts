import {Document} from '../../database'

export interface NknWorker {
  createDocument(): Promise<Document>
}
