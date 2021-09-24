import {StorageManager} from '~common/types/rpc/storage'
import {Database, Document} from './database'

class Storage implements StorageManager {
  db: Database

  constructor() {
    this.db = new Database()
  }

  async storageDocumentSave(document: Document): Promise<void> {
    await Document.put(document)
  }
}

export default Storage
