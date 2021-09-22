import {Database, DatabaseManager} from '~common/types/rpc/database'
import {db, Document} from './'

class Manager implements DatabaseManager {
  db: Database

  constructor() {
    this.db = db
  }

  async getDocumentById(id: string): Promise<Document> {
    return await Document.findOrCreate(id)
  }

  async saveDocument(document: Document): Promise<void> {
    await Document.put(document)
  }
}

export default Manager
