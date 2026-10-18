import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastContext';
import { ConfirmDialogProvider } from './context/ConfirmDialogContext';
import { CustomThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <CustomThemeProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <ConfirmDialogProvider>
            <AuthProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AuthProvider>
          </ConfirmDialogProvider>
        </ToastProvider>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

export default App;
