import * as Comlink from 'comlink'
import {RPC} from '~common/types/rpc'
import Manager from '~worker/database/manager'
import Network from '~worker/network'
import {NKN} from '~worker/nkn/nkn'

const db = new Manager()
const network = new Network(
  new NKN()
)

const rpc: RPC = {
  // DATABASE CALLS
  getDocumentById: async id => await db.getDocumentById(id),
  saveDocument: async document => await db.saveDocument(document),

  // NETWORK CALLS
  createDocument: async () => await network.createDocument(),
}

Comlink.expose(rpc)
