import {isDefined} from '@/utils'
import {useEffect, useState} from 'react'
import {useParams} from 'react-router-dom'
import {Box, FormControl, MenuItem, Select, SelectChangeEvent, Typography} from '@mui/material'
import {Document} from '@/modules/database'
import Header from '@/components/Header'
import Editor from '@/components/Editor'
import {languageOptions} from '@/components/Editor/languages'

let isSaved = true
let document: Document

export default function Doc() {
  const {id} = useParams<{ id: string }>()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState(-1)
  const [tabSize, setTabSize] = useState(2)

  function saveDocument() {
    if (!isSaved) {
      document.save()
      isSaved = true
    }
  }

  useEffect(() => {
    let handler: NodeJS.Timeout

    Document.findOrCreate(id).then(_document => {
      document = _document
      isDefined(document.title) && setTitle(document.title)
      isDefined(document.language) && setLanguage(document.language)
      isDefined(document.tabSize) && setTabSize(document.tabSize)
      isDefined(document.content) && setContent(document.content)

      handler = setInterval(saveDocument, 1000)
    })

    return () => clearInterval(handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onLanguageChange = ({target}: SelectChangeEvent) => {
    const value = parseInt(target.value)
    setLanguage(value)

    document.language = value
    isSaved = false
  }

  const onTabSizeChange = ({target}: SelectChangeEvent) => {
    const value = parseInt(target.value)
    setTabSize(value)

    document.tabSize = value
    isSaved = false
  }

  const onContentChange = (value: string) => {
    if (document && document.content !== value) {
      document.content = value
      isSaved = false
    }
  }

  return (
    <Box display="flex" flexDirection="column" sx={{
      height: '100vh',
    }}>
      <Header>
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box>
            <Typography variant="h5">{title}</Typography>
          </Box>
          <Box flexShrink={1}>
            <FormControl variant="standard" sx={{marginLeft: 2}}>
              <Select
                onChange={onTabSizeChange}
                value={tabSize.toString()}
              >
                <MenuItem key={1} value="1">1</MenuItem>
                <MenuItem key={2} value="2">2</MenuItem>
                <MenuItem key={4} value="4">4</MenuItem>
                <MenuItem key={6} value="6">6</MenuItem>
                <MenuItem key={8} value="8">8</MenuItem>
              </Select>
            </FormControl>
            <FormControl variant="standard" sx={{marginLeft: 2}}>
              <Select
                value={language.toString()}
                onChange={onLanguageChange}
              >
                <MenuItem key={-1} value="-1">Language</MenuItem>
                {languageOptions.map((value, index) => (
                  <MenuItem key={index} value={index.toString()}>{value}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Header>
      <Box sx={{
        flexGrow: 1,
        position: 'relative',
      }}>
        <Editor
          language={language}
          onChange={onContentChange}
          tabSize={tabSize}
          value={content}
        />
      </Box>
    </Box>
  )
}
