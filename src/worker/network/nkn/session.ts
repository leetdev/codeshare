import {Session as NcpSession} from '@nkn/ncp'
import {
  DirectSession,
  DirectSessionCloseHandlerFunction,
  DirectSessionMessageHandlerFunction,
} from '~common/types/rpc/network'
import {isKeepalive, KEEPALIVE_PACKET, keepaliveInterval, sessionTimeout} from './config'

export class Session implements DirectSession {
  private handlers: Set<DirectSessionMessageHandlerFunction> = new Set()
  private keepaliveTimeout?: ReturnType<typeof setInterval>
  private sessionTimeout?: ReturnType<typeof setTimeout>

  constructor(
    private readonly ncp: NcpSession,
    private readonly onClose?: DirectSessionCloseHandlerFunction,
  ) {
console.log('new session', ncp)
    this.resetKeepalive()
    this.resetTimeout()

    this.read().then()
  }

  async close(): Promise<void> {
    this.clearTimeouts()

    await this.ncp.close()
  }

  receive(handler: DirectSessionMessageHandlerFunction): void {
    this.handlers.add(handler)
  }

  async send(message: any): Promise<void> {
    this.resetKeepalive()

    const messageData = new TextEncoder().encode(JSON.stringify(message))
    const size = messageData.length
    const sizeData = new Uint8Array(new Uint32Array([size]).buffer)

    // concatenate data to prevent race conditions
    const data = new Uint8Array(sizeData.length + size)
    data.set(sizeData)
    data.set(messageData, sizeData.length)
console.log('send', message)
    await this.ncp.write(data)
  }

  private clearTimeouts() {
    this.keepaliveTimeout && clearInterval(this.keepaliveTimeout)
    this.sessionTimeout && clearTimeout(this.sessionTimeout)
  }

  private async read(): Promise<void> {
    try {
      while (!this.ncp.isClosed) {
        const controlPacket = await this.ncp.read(4)

        this.resetTimeout()

        if (isKeepalive(controlPacket)) {
          continue
        }

        const size = new Uint32Array(controlPacket.buffer)[0]
        const messageData = await this.ncp.read(size)
        const message = JSON.parse(new TextDecoder().decode(messageData))
console.log('read', message)
        this.handlers.forEach(handler => handler(message))
      }
    } catch (e) {
      console.log('SESSION CLOSED!', e)

      this.timeout()
    }
  }

  private resetKeepalive() {
    this.keepaliveTimeout && clearInterval(this.keepaliveTimeout)
    this.keepaliveTimeout = setInterval(() => this.sendKeepalive(), keepaliveInterval)
  }

  private resetTimeout() {
    this.sessionTimeout && clearTimeout(this.sessionTimeout)
    this.sessionTimeout = setTimeout(() => this.timeout(), sessionTimeout)
  }

  private async sendKeepalive(): Promise<void> {
    if (this.ncp.isClosed) {
      return this.timeout()
    }
    await this.ncp.write(KEEPALIVE_PACKET)
  }

  private timeout() {
    console.log('Session timeout', this)

    this.clearTimeouts()

    this.ncp.isClosed || this.ncp.close()

    this.onClose && this.onClose(this)
  }
}
