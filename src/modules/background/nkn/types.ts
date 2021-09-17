export interface NknWorker {
  createDocument(): Promise<Document>
}

export interface Document {
  id: string
  title: string
  // syntax:
  tabSize: number
}
