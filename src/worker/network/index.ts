import {DocumentUpdate} from '~common/types/protocol'
import {GetDocumentCallback} from '~common/types/rpc/network'
import {generateDocumentId} from '~common/utils'
import {Document} from '~worker/storage/database'
import {provider} from './config'
import {Session} from './session'

const sessions = new Map<string, Session>()

export async function netDocumentCreate(): Promise<Document> {
  let id, isValid
  do {
    id = generateDocumentId()
    isValid = !await provider.getSubscribersCount(id)
  } while (!isValid)

  return await Document.create(id)
}

export async function netDocumentPullUpdates(id: string, version: number, callback: (updates: DocumentUpdate[]) => void): Promise<void> {
  const session = sessions.get(id) as Session // TODO: error handling
  const updates = await session.authority.pullUpdates(version)

  callback(updates)
}

export async function netDocumentPushUpdates(id: string, version: number, updates: DocumentUpdate[]): Promise<void> {
  const session = sessions.get(id) as Session // TODO: error handling

  await session.authority.pushUpdates(version, updates)
}

export async function netDocumentStartSession(id: string, onGetDocument: GetDocumentCallback): Promise<Document> {
  const document = await Document.findOrCreate(id)

  sessions.set(id, new Session(document, provider, onGetDocument))

  return document
}
