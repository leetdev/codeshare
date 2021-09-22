import {db} from '~worker/database'
import {isDefined} from '~common/utils'

export interface IDocument {
  id: string
  title: string
  language: number
  tabSize: number
  content: string
}

export class Document implements IDocument {
  id: string
  title: string = 'New Document'
  language: number = -1
  tabSize: number = 1
  content: string = ''

  constructor(id: string, title?: string, language?: number, tabSize?: number, content?: string) {
    this.id = id

    if (isDefined(title)) this.title = title as string
    if (isDefined(language)) this.language = language as number
    if (isDefined(tabSize)) this.tabSize = tabSize as number
    if (isDefined(content)) this.content = content as string
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

  static async put(document: Document) {
    return db.documents.put(document)
  }

  async save() {
    return Document.put(this)
  }
}
