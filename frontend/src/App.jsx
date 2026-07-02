// frontend/src/App.jsx
import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AppRoutes from './Routes';
import store from './store'; // Assuming a Redux store is defined in src/store/index.js or src/store.js
import ErrorBoundary from './components/ErrorBoundary';

const ThemeWrapper = ({ children }) => {
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: 'dark',
        background: {
          default: '#0B0F19',
          paper: '#131A2D',
        },
        primary: { main: '#f59e0b' }, // amber-500
        secondary: { main: '#3b82f6' }, // blue-500
        success: { main: '#10b981' }, // emerald-500
        error: { main: '#ef4444' }, // red-500
        text: {
          primary: '#f3f4f6', // gray-100
          secondary: '#d1d5db', // gray-300
        },
        divider: '#1E2943', // brand-border
      },
      typography: {
        fontFamily: '"Inter", sans-serif',
        h1: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
        h2: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
        h3: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
        h4: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
        h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
        h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
        body1: { fontSize: '0.75rem' }, // standard 12px text-xs density
        body2: { fontSize: '0.6875rem' }, // sub-text text-[11px]
      },
      shape: {
        borderRadius: 12, // rounded-xl for panels
      },
      components: {
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
              border: '1px solid #1E2943',
              boxShadow: 'none',
            }
          }
        },
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8, // rounded-lg for buttons
              textTransform: 'none',
              fontWeight: 600,
            }
          }
        }
      }
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

function App() {
  return (
    <Provider store={store}>
      <ThemeWrapper>
        <ErrorBoundary>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeWrapper>
    </Provider>
  );
}

export default App;