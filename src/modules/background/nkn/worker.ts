import * as Comlink from 'comlink'
import {NKN} from './nkn'
import {NknWorker} from './types'

interface PrivateMembers {
  _nkn: NKN
}

const nkn: NknWorker & PrivateMembers = {
  _nkn: new NKN(),

  test(msg) {
    console.log('sw: ' + msg)
    return 'polo'
  }
}

Comlink.expose(nkn)
