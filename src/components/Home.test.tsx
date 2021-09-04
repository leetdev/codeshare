import {render, screen} from '@testing-library/react'
import {Home} from './Home'

test('renders title element', () => {
  render(<Home/>)
  const titleElement = screen.getByText(/codeshare/i)
  expect(titleElement).toBeInTheDocument()
})
