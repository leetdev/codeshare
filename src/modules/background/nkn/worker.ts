import * as Comlink from 'comlink'
import {NKN} from './nkn'
import type {NknWorker} from './types'

const instance = new NKN()

const nkn: NknWorker = {
  createDocument: () => instance.createDocument(),
}

Comlink.expose(nkn)
