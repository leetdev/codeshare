import {NetworkManager} from '~common/types/rpc/network'
import {DatabaseManager} from '~common/types/rpc/database'

export type RPC = DatabaseManager & NetworkManager
