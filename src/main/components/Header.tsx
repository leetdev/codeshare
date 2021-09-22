import {ReactElement, ReactNode} from 'react'
import {Box, Link, Typography} from '@mui/material'

import logo from '~main/assets/images/logo.svg'

interface Props {
  children?: ReactNode
}

const Header = ({children}: Props): ReactElement<Props> => (
  <Box display="flex" flexDirection="row" justifyContent="space-between" sx={{
    bgcolor: 'background.paper',
    padding: 1,
  }}>
    <Box>
      <Link href="/" color="inherit" underline="none">
        <Box component="img" src={logo} alt="NKN" display="inline" sx={{
          height: 33,
          verticalAlign: 'middle',
          marginRight: 1,
        }}/>
        <Typography variant="h5" display="inline">nkn codeshare</Typography>
      </Link>
    </Box>
    <Box flexGrow={1} marginLeft={4}>{children}</Box>
  </Box>
)

export default Header
