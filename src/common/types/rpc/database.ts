import type {Document} from '~worker/database'

export type {Data, Database, Document} from '~worker/database'

export interface DatabaseManager {
  getDocumentById(id: string): Promise<Document>
  saveDocument(document: Document): Promise<void>
}
