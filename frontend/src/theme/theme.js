import { createTheme } from '@mui/material/styles';

// Dark purple premium theme tokens
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6',
      contrastText: '#F5F3FF'
    },
    secondary: { main: '#A855F7' },
    background: {
      default: '#0B0A12',
      paper: 'rgba(255,255,255,0.035)'
    },
    text: {
      primary: '#F5F3FF',
      secondary: '#A1A1AA'
    },
    divider: 'rgba(255,255,255,0.08)',
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    action: {
      hover: 'rgba(139,92,246,0.06)',
      selected: 'rgba(139,92,246,0.10)'
    },
    // custom tokens
    purple: {
      500: '#8B5CF6',
      600: '#7C3AED',
      400: '#A855F7'
    }
  },
  shape: { borderRadius: 18 },
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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(circle at 8% 6%, rgba(139,92,246,0.08), transparent 25%), radial-gradient(circle at 80% 20%, rgba(99,102,241,0.06), transparent 30%)`,
          backgroundColor: '#08080D',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(8,8,13,0.72)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
          transition: 'transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease'
        }
      }
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 18, background: 'rgba(255,255,255,0.02)' } } },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 999, textTransform: 'none', fontWeight: 700, paddingLeft: 16, paddingRight: 16 },
        containedPrimary: {
          backgroundImage: 'linear-gradient(135deg,#7C3AED,#A855F7,#6366F1)',
          color: '#fff',
          boxShadow: '0 8px 24px rgba(139,92,246,0.18)',
          '&:hover': { transform: 'translateY(-1px)', boxShadow: '0 12px 36px rgba(139,92,246,0.22)' }
        },
        outlinedPrimary: {
          border: '1px solid rgba(139,92,246,0.20)',
          color: 'rgba(255,255,255,0.92)',
          background: 'transparent'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          background: 'rgba(255,255,255,0.02)',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.06)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(139,92,246,0.12)' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#8B5CF6', boxShadow: '0 0 0 4px rgba(139,92,246,0.08)' }
        }
      }
    },
    MuiTextField: { defaultProps: { fullWidth: true } },
    MuiTableCell: { styleOverrides: { root: { borderBottom: '1px solid rgba(255,255,255,0.06)' } } },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          '&.Mui-selected': { background: 'rgba(139,92,246,0.12)', boxShadow: '0 0 20px rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.18)' }
        }
      }
    }
  }
});

export default theme;
