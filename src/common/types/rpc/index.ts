import {NetworkCalls} from '~common/types/rpc/network'
import {StorageCalls} from '~common/types/rpc/storage'

export type RPC = NetworkCalls & StorageCalls
