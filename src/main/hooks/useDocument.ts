import {useEffect, useRef, useState} from 'react'
import {Document} from '~common/types/rpc/storage'
import {useWorker} from '~main/hooks/useWorker'
import {RemoteRPC} from '~main/rpc'

type UpdateFn = (document: Document) => void

interface UseDocumentArgs {
  id: string

}

interface UseDocumentResults {
  document?: Document

  update(fn: UpdateFn): void
}

class DocumentWrapper {
  document?: Document
  isSaved: boolean = true

  constructor(private readonly rpc: RemoteRPC) {}

  setDocument(document: Document) {
    this.document = document
    this.isSaved = true
  }

  update(fn: UpdateFn): void {
    if (this.document) {
      fn(this.document)

      this.isSaved = false
    }
  }

  async save() {
    if (!this.isSaved && this.document) {
      this.isSaved = true

      await this.rpc.storageDocumentSave(this.document)
    }
  }
}

export const useDocument = ({id}: UseDocumentArgs): UseDocumentResults => {
  const {rpc} = useWorker()
  const [document, setDocument] = useState<Document>()
  const {current: wrapper} = useRef<DocumentWrapper>(new DocumentWrapper(rpc))

  useEffect(() => {
    rpc.netDocumentStartSession(id).then(async _document => {
      wrapper.setDocument(_document)
      setDocument(_document)
    })

    const handler = setInterval(wrapper.save.bind(wrapper), 1000)
    return () => clearInterval(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return {
    document,
    update: wrapper.update.bind(wrapper),
  }
}
