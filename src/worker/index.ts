import * as Comlink from 'comlink'
import {RPC} from '~common/types/rpc'
import Storage from '~worker/storage'
import Network from '~worker/network'
import {nkn} from '~worker/network/nkn'

const storage = new Storage()
const network = new Network(nkn)

const rpc: RPC = {
  // STORAGE CALLS
  storageDocumentSave: async document => await storage.storageDocumentSave(document),

  // NETWORK CALLS
  netDocumentCreate: async () => await network.netDocumentCreate(),
  netDocumentStartSession: async id => await network.netDocumentStartSession(id),
}

Comlink.expose(rpc)
