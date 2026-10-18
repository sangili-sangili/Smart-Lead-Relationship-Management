import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { COLOR_PALETTE } from '../constants/statusColors';

const CompaniesPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR_PALETTE.textPrimary }}>
          Companies
        </Typography>
        <Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary }}>
          Manage client accounts and explore associated non-deleted leads.
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, border: `1px solid ${COLOR_PALETTE.border}` }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: COLOR_PALETTE.textSecondary }}>
            Companies routing foundation configured. Full CRUD and associated leads drill-down will be implemented in Prompt 6.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompaniesPage;
