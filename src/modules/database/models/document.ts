import {db} from '../'

export interface IDocument {
  id: string
  title: string
  // syntax:
  tabSize: number
  content: string
}

export class Document implements IDocument {
  id: string
  title: string = 'New Document'
  tabSize: number = 2
  content: string = ''

  constructor(id: string, title?: string, tabSize?: number, content?: string) {
    this.id = id

    if (title) this.title = title
    if (tabSize) this.tabSize = tabSize
    if (content) this.content = content
  }

  static async create(id: string): Promise<Document> {
    const document = new Document(id)
    await document.save()

    return document
  }

  async save() {
    return db.documents.put(this)
  }
}
