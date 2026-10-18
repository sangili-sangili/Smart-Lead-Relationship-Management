import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { COLOR_PALETTE } from '../constants/statusColors';

const LeadsPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR_PALETTE.textPrimary }}>
          Leads
        </Typography>
        <Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary }}>
          Manage your sales leads, track statuses, and assign team owners.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, border: `1px solid ${COLOR_PALETTE.border}` }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: COLOR_PALETTE.textSecondary }}>
            Leads routing foundation configured. Full CRUD, search, filter, and soft deletion will be implemented in Prompt 5.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LeadsPage;
