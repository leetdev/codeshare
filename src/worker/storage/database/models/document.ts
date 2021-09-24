import {IndexableType} from 'dexie'
import {isDefined} from '~common/utils'
import {db} from '..'

export interface IDocument {
  id: string
  content: string
  language: number
  tabSize: number
  title: string
  version: number

  save(): Promise<IndexableType>
}

export class Document implements IDocument {
  id: string
  content: string = ''
  language: number = -1
  tabSize: number = 1
  title: string = 'New Document'
  version: number = 0

  constructor(id: string, content?: string, language?: number, tabSize?: number, title?: string, version?: number) {
    this.id = id

    if (isDefined(content)) this.content = content as string
    if (isDefined(language)) this.language = language as number
    if (isDefined(tabSize)) this.tabSize = tabSize as number
    if (isDefined(title)) this.title = title as string
    if (isDefined(version)) this.version = version as number
  }

  static async create(id: string): Promise<Document> {
    const document = new Document(id)
    await document.save()

    return document
  }

  static async find(id: string): Promise<Document | null> {
    return await db.documents.where({id}).first() || null
  }

  static async findOrCreate(id: string): Promise<Document> {
    return await Document.find(id) || await Document.create(id)
  }

  static async put(document: Document): Promise<IndexableType> {
    return db.documents.put(document)
  }

  async save(): Promise<IndexableType> {
    return await Document.put(this)
  }
}
