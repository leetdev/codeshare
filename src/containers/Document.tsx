import {Typography} from '@mui/material'
import {useParams} from 'react-router-dom'

export default function Doc() {
  const {id} = useParams<{id: string}>()

  return (
    <Typography>{id}</Typography>
  )
}
