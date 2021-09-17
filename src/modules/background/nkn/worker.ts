import * as Comlink from 'comlink'
import {NKN} from './nkn'
import type {Document, NknWorker} from './types'

const instance = new NKN()

const nkn: NknWorker = {
  createDocument: (): Promise<Document> => instance.createDocument()
}

Comlink.expose(nkn)
