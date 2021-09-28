import * as Comlink from 'comlink'
import {RPC} from '~common/types/rpc'
import {
  netDocumentCreate,
  netDocumentPullUpdates,
  netDocumentPushUpdates,
  netDocumentStartSession,
} from '~worker/network'
import {storageDocumentSave} from '~worker/storage'

const rpc: RPC = {
  storageDocumentSave,
  netDocumentCreate,
  netDocumentPullUpdates,
  netDocumentPushUpdates,
  netDocumentStartSession,
}

Comlink.expose(rpc)
