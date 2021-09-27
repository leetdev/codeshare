import {Session as NcpSession} from '@nkn/ncp'
import {DirectSession, DirectSessionMessageHandlerFunction} from '~common/types/rpc/network'

export class Session implements DirectSession {
  private handlers: Set<DirectSessionMessageHandlerFunction> = new Set()
  private ncp: NcpSession

  constructor(ncpSession: NcpSession) {
    this.ncp = ncpSession

    this.read().then()
  }

  receive(handler: DirectSessionMessageHandlerFunction): void {
    this.handlers.add(handler)
  }

  async send(message: any): Promise<void> {
    const messageData = new TextEncoder().encode(JSON.stringify(message))
    const size = messageData.length
    const sizeData = new Uint8Array((new Uint32Array([size]).buffer))

    await this.ncp.write(sizeData)
    await this.ncp.write(messageData)
  }

  private async read() {
    try {
      while (!this.ncp.isClosed) {
        const sizeData = await this.ncp.read(4)
        const size = new Uint32Array(sizeData.buffer)[0]

        const messageData = await this.ncp.read(size)
        const message = JSON.parse(new TextDecoder().decode(messageData))

        this.handlers.forEach(handler => handler(message))
      }
    } catch (e) {
      console.log('SESSION CLOSED! TODO: HANDLE', e)
    }
  }
}
