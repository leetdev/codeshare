import {Session as NcpSession} from '@nkn/ncp'
import {DirectSession, DirectSessionMessageHandlerFunction} from '~common/types/rpc/network'

export class Session implements DirectSession {
  private handlers: Set<DirectSessionMessageHandlerFunction> = new Set()
  private ncp: NcpSession

  constructor(ncpSession: NcpSession) {
    this.ncp = ncpSession
console.log('new session', ncpSession)
    this.read().then()
  }

  async close(): Promise<void> {
    await this.ncp.close()
  }

  receive(handler: DirectSessionMessageHandlerFunction): void {
    this.handlers.add(handler)
  }

  async send(message: any): Promise<void> {
    const messageData = new TextEncoder().encode(JSON.stringify(message))
    const size = messageData.length
    const sizeData = new Uint8Array((new Uint32Array([size]).buffer))

    // concatenate data to prevent race conditions
    const data = new Uint8Array(sizeData.length + size)
    data.set(sizeData)
    data.set(messageData, sizeData.length)
console.log('send', message)
    await this.ncp.write(data)
  }

  private async read() {
    try {
      while (!this.ncp.isClosed) {
        const sizeData = await this.ncp.read(4)
        const size = new Uint32Array(sizeData.buffer)[0]
        const messageData = await this.ncp.read(size)
        const message = JSON.parse(new TextDecoder().decode(messageData))
console.log('read', message)
        this.handlers.forEach(handler => handler(message))
      }
    } catch (e) {
      console.log('SESSION CLOSED! TODO: HANDLE', e)
    }
  }
}
