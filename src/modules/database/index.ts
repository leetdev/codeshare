import {Dexie} from 'dexie'
import {Document} from './models/document'

export {Data} from './models/data'
export {Document}

class Db extends Dexie {
  data: Dexie.Table<IData>
  documents: Dexie.Table<Document>

  constructor() {
    super('nknCodeshare')

    this.version(1).stores({
      data: '&name',
      documents: '&id',
    })

    this.data = this.table('data')

    this.documents = this.table('documents')
    this.documents.mapToClass(Document)
  }
}

export interface IData {
  name: string,
  value: string,
}

export const db = new Db()

export default db
