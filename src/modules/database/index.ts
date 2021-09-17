import {Dexie} from 'dexie'
import type {Document} from '../background/nkn/types'

export {Data} from './models/data'

class Db extends Dexie {
  data?: Dexie.Table<IData>
  documents?: Dexie.Table<Document>

  constructor() {
    super('nknCodeshare')

    this.version(1).stores({
      data: '&name',
      documents: '&id',
    })
  }
}

interface IData {
  name: string,
  value: string,
}

export const db = new Db()

export default db
