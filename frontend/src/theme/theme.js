import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1677FF', dark: '#0D3B66', light: '#5DA8FF' },
    background: { default: '#F3F6FA', paper: '#FFFFFF' },
    secondary: { main: '#F7F9FC' },
    text: { primary: '#111827', secondary: '#667085' },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    divider: '#E5EAF0'
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    body1: { fontSize: '0.95rem', lineHeight: 1.6 },
    body2: { fontSize: '0.9rem', lineHeight: 1.6 }
  },
  components: {
    MuiCard: { styleOverrides: { root: { borderRadius: 24, border: '1px solid #E5EAF0', boxShadow: '0 8px 30px rgba(15, 23, 42, 0.04)' } } },
    MuiButton: { styleOverrides: { root: { borderRadius: 999, textTransform: 'none', fontWeight: 600, px: 2 } } },
    MuiPaper: { styleOverrides: { root: { borderRadius: 24 } } },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 14 } } }
  }
});

export default theme;
