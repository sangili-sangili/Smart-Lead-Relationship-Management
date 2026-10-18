import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { CustomThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <CustomThemeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <ConfirmDialogProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </ConfirmDialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

export default App;
