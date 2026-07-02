// frontend/src/App.jsx
import React, { useMemo } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import AppRoutes from './Routes';
import store from './store'; // Assuming a Redux store is defined in src/store/index.js or src/store.js
import ErrorBoundary from './components/ErrorBoundary';

const ThemeWrapper = ({ children }) => {
  const themeMode = useSelector(state => state.settings?.themeMode || 'light');

  const theme = useMemo(() => {
    let paletteConfig = { mode: 'light' };
    if (themeMode === 'dark') {
      paletteConfig = { mode: 'dark' };
    } else if (themeMode === 'dark-red') {
      paletteConfig = {
        mode: 'dark',
        primary: { main: '#ff5252' },
        background: { default: '#2b0000', paper: '#4a0000' },
      };
    }
    return createTheme({ palette: paletteConfig });
  }, [themeMode]);

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