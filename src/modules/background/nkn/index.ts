import * as Comlink from 'comlink'
import type {Remote} from 'comlink'
import type {NknWorker} from './types'

export const worker: Remote<NknWorker> = Comlink.wrap(
  new Worker(new URL('./worker', import.meta.url))
)
