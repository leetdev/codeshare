import {nkn} from '@/modules'
import {Document} from '@/modules/database'

const network = {
  createDocument: (): Promise<Document> => nkn.worker.createDocument()
}

export default network
