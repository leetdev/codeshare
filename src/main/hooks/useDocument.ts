import {useEffect, useState} from 'react'
import {Document} from '~common/types/rpc/database'
import {rpc} from '~main/rpc'

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

      await rpc.saveDocument(this.document)
    }
  }
}

export const useDocument = ({id}: UseDocumentArgs): UseDocumentResults => {
  const [document, setDocument] = useState<Document>()
  const [wrapper] = useState<DocumentWrapper>(new DocumentWrapper())

  useEffect(() => {
    rpc.getDocumentById(id).then(_document => {
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
