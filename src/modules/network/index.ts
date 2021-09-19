import {nkn} from '../'
import {Document} from '../database'

const network = {
  createDocument: (): Promise<Document> => nkn.worker.createDocument()
}

export default network
