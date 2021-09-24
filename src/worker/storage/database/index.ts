import {Dexie} from 'dexie'
import {Document, IDocument} from './models/document'
import {Data, IData} from './models/data'

export {Data, Document}
export type {IData, IDocument}

export class Database extends Dexie {
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

export const db = new Database()
