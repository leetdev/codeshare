import * as Comlink from 'comlink'
import type {RPC} from '~common/types/rpc'

export {proxy, transfer} from 'comlink'

export type RemoteRPC = Comlink.Remote<RPC>

export type RemoteProxyFactory = <T>(obj: T) => T & Comlink.ProxyMarked

export type RemoteTransferFactory = <T>(obj: T, transfers: Transferable[]) => T

export const rpc: RemoteRPC = Comlink.wrap(
  new Worker(new URL('../worker/index', import.meta.url))
)
