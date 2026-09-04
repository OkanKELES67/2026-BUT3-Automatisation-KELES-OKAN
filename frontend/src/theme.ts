import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  colorSchemes: { light: true, dark: true },
  cssVariables: { colorSchemeSelector: 'media' },
  palette: {
    primary: { main: '#1565c0' },
  },
  shape: { borderRadius: 10 },
  typography: {
    h1: { fontSize: '1.75rem', fontWeight: 600 },
  },
})
