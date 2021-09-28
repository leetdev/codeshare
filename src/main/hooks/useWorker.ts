import {RemoteProxyFactory, RemoteRPC, RemoteTransferFactory, rpc, proxy, transfer} from '~main/rpc'

interface Results {
  rpc: RemoteRPC
  proxy: RemoteProxyFactory
  transfer: RemoteTransferFactory
}

export const useWorker = (): Results => {
  return {
    rpc,
    proxy,
    transfer,
  }
}
