import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {CssBaseline, ThemeProvider} from '@mui/material'

import {App} from '~main/components'
import theme from '~main/theme'
import {reportWebVitals} from '~main/reportWebVitals'

ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <App/>
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById('root'),
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
