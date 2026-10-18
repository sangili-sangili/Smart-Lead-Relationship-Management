import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { ROUTES } from '../constants/routes';
import { COLOR_PALETTE } from '../constants/statusColors';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    // Phase 2 routing skeleton simulation (Phase 4 connects full backend auth)
    setTimeout(() => {
      localStorage.setItem('leadflow_token', 'mock_jwt_token_for_phase2');
      localStorage.setItem(
        'leadflow_user',
        JSON.stringify({ name: 'John Doe', email, role: 'Admin' })
      );
      setLoading(false);
      navigate(ROUTES.DASHBOARD);
    }, 600);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: COLOR_PALETTE.background,
        p: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          maxWidth: 960,
          width: '100%',
          bgcolor: '#FFFFFF',
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
          border: `1px solid ${COLOR_PALETTE.border}`
        }}
      >
        {/* Left Illustration / Marketing Panel */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '45%',
            bgcolor: COLOR_PALETTE.navy,
            color: '#FFFFFF',
            p: 4.5,
            background: `linear-gradient(135deg, ${COLOR_PALETTE.navy} 0%, #312E81 100%)`
          }}
        >
          <Box>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: 'rgba(255, 255, 255, 0.12)',
                px: 1.5,
                py: 0.6,
                borderRadius: 2,
                mb: 4
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#A5B4FC' }}>
                Mini CRM
              </Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.25, mb: 1.5, color: '#FFFFFF' }}>
              Smarter Leads, Bigger Opportunities
            </Typography>
            <Typography variant="body2" sx={{ color: '#C7D2FE', lineHeight: 1.6 }}>
              Manage your leads, companies, and tasks all in one place with real-time performance insights.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <Typography variant="caption" sx={{ color: '#93C5FD', display: 'block', mb: 0.5 }}>
              Enterprise Performance
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Live backend aggregation & strict security authorization
            </Typography>
          </Box>
        </Box>

        {/* Right Form Card */}
        <Box sx={{ flex: 1, p: { xs: 3, sm: 5 } }}>
          <Box sx={{ mb: 3.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR_PALETTE.textPrimary, mb: 0.5 }}>
              Welcome Back
            </Typography>
            <Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary }}>
              Sign in to your Mini CRM account
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: COLOR_PALETTE.textPrimary, mb: 0.8, display: 'block' }}>
                Email Address
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: COLOR_PALETTE.textPrimary }}>
                  Password
                </Typography>
                <Link href="#" variant="caption" sx={{ color: COLOR_PALETTE.primary, textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </Box>
              <TextField
                fullWidth
                size="small"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{ color: COLOR_PALETTE.textSecondary }}
                />
              }
              label={<Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary }}>Remember me</Typography>}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: COLOR_PALETTE.primary,
                py: 1.2,
                fontWeight: 600,
                fontSize: '0.95rem'
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
            </Button>
          </Box>

          <Box sx={{ mt: 3.5, textAlign: 'center' }}>
            <Typography variant="caption" sx={{ color: COLOR_PALETTE.textSecondary }}>
              Don't have an account?{' '}
              <Link href="#" sx={{ color: COLOR_PALETTE.primary, fontWeight: 600, textDecoration: 'none' }}>
                Contact admin
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
