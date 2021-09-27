declare module '@nkn/ncp' {
  export class Session {
    isClosed: boolean

    read(maxSize: number): Promise<Uint8Array>
    write(b: Uint8Array): Promise<void>
  }
}
