import * as Comlink from 'comlink'
import {RPC} from '~common/types/rpc'
import Storage from '~worker/storage'
import Network from '~worker/network'
import {nkn} from '~worker/network/nkn'

const storage = new Storage()
const network = new Network(nkn)

const rpc: RPC = {
  // STORAGE CALLS
  storageDocumentSave: document => storage.storageDocumentSave(document),

  // NETWORK CALLS
  netDocumentCreate: () => network.netDocumentCreate(),
  netDocumentPullUpdates: (id, version, callback) => network.netDocumentPullUpdates(id, version, callback),
  netDocumentPushUpdates: (id, version, updates) => network.netDocumentPushUpdates(id, version, updates),
  netDocumentStartSession: id => network.netDocumentStartSession(id)
}

Comlink.expose(rpc)
