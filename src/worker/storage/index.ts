import {Document} from './database'

export async function storageDocumentSave(document: Document): Promise<void> {
  await Document.put(document)
}
