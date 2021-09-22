import * as Comlink from 'comlink'
import {Remote} from 'comlink'

import type {RPC} from '~common/types/rpc'

export const rpc: Remote<RPC> = Comlink.wrap(
  new Worker(new URL('../worker/index', import.meta.url))
)
