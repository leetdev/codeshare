import {IData as Data, IDocument as Document} from '~worker/database'

export type {Data, Document}

export type {Database} from '~worker/database'

export interface DatabaseManager {
  getDocumentById(id: string): Promise<Document>
  saveDocument(document: Document): Promise<void>
}
