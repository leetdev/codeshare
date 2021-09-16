import {nkn} from '../'

const network = {
  test: async () => {
    console.log(nkn.worker)
    console.log('received: ' + await nkn.worker.test('marco'))
  }
}

export default network
