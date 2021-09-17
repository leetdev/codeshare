import {grey} from '@mui/material/colors'
import {createTheme} from '@mui/material/styles'

// A custom theme for this app
const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: grey['900'],
      paper: grey['800'],
    },
  },
})

export default theme
