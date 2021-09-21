import {loadLanguage} from '@/components/Editor/languages'
import {ReactElement, useEffect, useMemo, useRef, useState} from 'react'
import {basicSetup} from '@codemirror/basic-setup'
import {Compartment, EditorState, Extension} from '@codemirror/state'
import {EditorView, keymap, ViewUpdate} from '@codemirror/view'
import {indentWithTab} from '@codemirror/commands'
import {oneDark} from '@codemirror/theme-one-dark'

import '@/assets/styles/Editor.css'

type Themes = {
  [name: string]: Extension
}

export const themes: Themes = {
  'One Dark': oneDark,
}

interface Props {
  language?: number

  onChange?(value: string): void

  tabSize?: number
  theme?: string
  value: string
}

const Editor = ({language = -1, onChange, tabSize = 2, theme = 'One Dark', value}: Props): ReactElement<Props> => {
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
    (async function () {
      if (element.current) {
        setView(new EditorView({
          state: EditorState.create({
            doc: value,
            extensions: await composeExtensions(),
          }),
          parent: element.current,
        }))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element])

  useEffect(() => {
    if (view) {
      view.focus()
    }

    // CLEANUP
    return () => {
      if (view) {
        view.destroy()
      }
    }
  }, [view])

  // VALUE CHANGE
  useEffect(() => {
    if (view) {
      view.dispatch({
        changes: {from: 0, to: view.state.doc.toString().length, insert: value || ''},
      })
    }
  }, [value, view])

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
