import * as Comlink from 'comlink'
import {Remote} from 'comlink'

import {NknWorker} from './types'

export const worker: Remote<NknWorker> = Comlink.wrap(
  new Worker(new URL('./worker', import.meta.url))
)
