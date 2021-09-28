import type {IData as Data, IDocument as Document} from '~worker/storage/database'

export type {Data, Document}

export interface StorageCalls {
  storageDocumentSave(document: Document): Promise<void>
}
