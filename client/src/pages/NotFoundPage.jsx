import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { COLOR_PALETTE } from '../constants/statusColors';

const NotFoundPage = () => {
  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 800, color: COLOR_PALETTE.primary, mb: 1 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 600, color: COLOR_PALETTE.textPrimary, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary, mb: 3 }}>
        The page you are looking for does not exist or has been moved.
      </Typography>
      <Button component={RouterLink} to={ROUTES.DASHBOARD} variant="contained" sx={{ bgcolor: COLOR_PALETTE.primary }}>
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
