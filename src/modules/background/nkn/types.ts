import {Document} from '@/modules/database'

export interface NknWorker {
  createDocument(): Promise<Document>
}
