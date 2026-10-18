import { createTheme } from '@mui/material/styles';
import { COLOR_PALETTE } from '../constants/statusColors';

const theme = createTheme({
  palette: {
    primary: {
      main: COLOR_PALETTE.primary,
      dark: COLOR_PALETTE.primaryHover,
      light: COLOR_PALETTE.primaryLight,
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: COLOR_PALETTE.navy,
      contrastText: '#FFFFFF'
    },
    background: {
      default: COLOR_PALETTE.background,
      paper: COLOR_PALETTE.surface
    },
    text: {
      primary: COLOR_PALETTE.textPrimary,
      secondary: COLOR_PALETTE.textSecondary
    },
    divider: COLOR_PALETTE.border,
    success: {
      main: COLOR_PALETTE.success
    },
    warning: {
      main: COLOR_PALETTE.warning
    },
    error: {
      main: COLOR_PALETTE.error
    },
    info: {
      main: COLOR_PALETTE.info
    }
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2rem', // 32px
      fontWeight: 600,
      lineHeight: 1.25,
      color: COLOR_PALETTE.textPrimary
    },
    h2: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.33,
      color: COLOR_PALETTE.textPrimary
    },
    h3: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.55,
      color: COLOR_PALETTE.textPrimary
    },
    body1: {
      fontSize: '0.875rem', // 14px
      lineHeight: 1.45,
      color: COLOR_PALETTE.textPrimary
    },
    body2: {
      fontSize: '0.75rem', // 12px
      lineHeight: 1.33,
      color: COLOR_PALETTE.textSecondary
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem'
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(99, 102, 241, 0.2)'
          }
        },
        containedPrimary: {
          backgroundColor: COLOR_PALETTE.primary,
          '&:hover': {
            backgroundColor: COLOR_PALETTE.primaryHover
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${COLOR_PALETTE.border}`
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 12
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${COLOR_PALETTE.border}`,
          padding: '12px 16px',
          fontSize: '0.875rem'
        },
        head: {
          fontWeight: 600,
          color: COLOR_PALETTE.textSecondary,
          backgroundColor: '#F8FAFC'
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 6,
          fontSize: '0.75rem'
        }
      }
    }
  }
});

export default theme;
