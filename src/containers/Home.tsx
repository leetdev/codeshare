import {Add as AddIcon} from '@mui/icons-material'
import {Box, Stack} from '@mui/material'
import {LoadingButton} from '@mui/lab'
import {useState} from 'react'
import {useHistory} from 'react-router-dom'
import {network} from '../modules'
import Header from '../components/Header'

export default function Home() {
  const [isCreating, setIsCreating] = useState(false)
  const history = useHistory()

  const createDocument = async () => {
    setIsCreating(true)

    const document = await network.createDocument()
    history.push(`/${document.id}`)
  }

  return (
    <>
      <Header/>
      <Box sx={{
        margin: 4,
      }}>
        <Stack direction="row" justifyContent="center">
          <LoadingButton
            variant="contained"
            size="large"
            startIcon={<AddIcon/>}
            loadingPosition="start"
            loading={isCreating}
            onClick={createDocument}
          >
            Create New Document
          </LoadingButton>
        </Stack>
      </Box>
    </>
  )
}
