import {nkn} from '../'
import type {Document} from '../background/nkn/types'

const network = {
  createDocument: (): Promise<Document> => nkn.worker.createDocument()
}

export default network
