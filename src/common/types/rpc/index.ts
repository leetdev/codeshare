import {NetworkManager} from '~common/types/rpc/network'
import {StorageManager} from '~common/types/rpc/storage'

export type RPC = NetworkManager & StorageManager
