import {ReactElement, useEffect, useMemo, useRef, useState} from 'react'
import {basicSetup} from '@codemirror/basic-setup'
import {Compartment, EditorState, Extension} from '@codemirror/state'
import {EditorView, keymap, ViewUpdate} from '@codemirror/view'
import {indentWithTab} from '@codemirror/commands'
import {oneDark} from '@codemirror/theme-one-dark'
import {useWorker} from '~main/hooks/useWorker'
import {loadLanguage} from './languages'
import {peerExtension} from './peerExtension'

import '~main/assets/styles/Editor.css'

type Themes = {
  [name: string]: Extension
}

export const themes: Themes = {
  'One Dark': oneDark,
}

interface Props {
  documentId: string,
  isDocumentLoaded: boolean,
  language?: number
  startVersion?: number
  tabSize?: number
  theme?: string
  value: string

  onChange?(value: string): void
}

const Editor = ({
  documentId,
  isDocumentLoaded,
  language = -1,
  onChange,
  startVersion = 0,
  tabSize = 2,
  theme = 'One Dark',
  value,
}: Props): ReactElement<Props> => {
  const {rpc} = useWorker()
  const element = useRef<HTMLDivElement>(null)
  const [view, setView] = useState<EditorView>()
  const compartments = useMemo(() => ({
    language: new Compartment(),
    tabSize: new Compartment(),
    theme: new Compartment(),
  }), [])

  const composeExtensions = async (): Promise<Extension> => {
    if (!themes.hasOwnProperty(theme)) {
      throw new Error(`Invalid theme: ${theme}`)
    }

    let extensions = [
      basicSetup,
      keymap.of([indentWithTab]),
      compartments.theme.of(themes[theme]),
      compartments.language.of(await loadLanguage(language)),
      compartments.tabSize.of(EditorState.tabSize.of(tabSize)),
      peerExtension(documentId, startVersion, rpc),
    ]

    if (onChange && typeof onChange === 'function') {
      extensions.push(EditorView.updateListener.of((viewUpdate: ViewUpdate) => {
        if (viewUpdate.docChanged) {
          onChange(viewUpdate.state.doc.toString())
        }
      }))
    }

    return extensions
  }

  // CODEMIRROR INITIALIZATION
  useEffect(() => {
    if (isDocumentLoaded && element.current) {
      composeExtensions().then(extensions => {
        setView(new EditorView({
          state: EditorState.create({
            doc: value,
            extensions,
          }),
          parent: element.current as HTMLDivElement,
        }))
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element, isDocumentLoaded])

  useEffect(() => {
    view?.focus()

    // CLEANUP
    return () => {
      view?.destroy()
    }
  }, [view])

  // VALUE CHANGE
  useEffect(() => {
    if (view) {
      console.log('New value: ' + value)
      composeExtensions().then(extensions => view.setState(EditorState.create({
        doc: value,
        extensions,
      })))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // LANGUAGE CHANGE
  useEffect(() => {
    if (view) {
      loadLanguage(language).then(result => view.dispatch({effects: compartments.language.reconfigure(result)}))
    }
  }, [compartments, view, language])

  // TAB SIZE CHANGE
  useEffect(() => {
    if (view) {
      view.dispatch({effects: compartments.tabSize.reconfigure(EditorState.tabSize.of(tabSize))})
    }
  }, [compartments, view, tabSize])

  // THEME CHANGE
  useEffect(() => {
    if (view) {
      if (!themes.hasOwnProperty(theme)) {
        throw new Error(`Invalid theme: ${theme}`)
      }

      view.dispatch({effects: compartments.theme.reconfigure(themes[theme])})
    }
  }, [compartments, view, theme])

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      overflow: 'auto',
    }} ref={element}/>
  )
}

export default Editor
