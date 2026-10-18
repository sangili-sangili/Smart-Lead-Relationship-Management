import React from 'react';
import { Box, Typography, Grid, Paper, Card, CardContent } from '@mui/material';
import { COLOR_PALETTE } from '../constants/statusColors';

const DashboardPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR_PALETTE.textPrimary }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary }}>
          Welcome back, here's what's happening with your CRM pipeline.
        </Typography>
      </Box>

      {/* Top Stats Cards Placeholder */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Total Leads', value: '120', trend: '+12%', color: COLOR_PALETTE.primary },
          { label: 'Qualified Leads', value: '45', trend: '+8%', color: COLOR_PALETTE.success },
          { label: 'Tasks Due Today', value: '8', trend: '-2%', color: COLOR_PALETTE.warning },
          { label: 'Completed Tasks', value: '30', trend: '+15%', color: COLOR_PALETTE.info }
        ].map((stat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${COLOR_PALETTE.border}` }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="caption" sx={{ color: COLOR_PALETTE.textSecondary, fontWeight: 600 }}>
                  {stat.label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: COLOR_PALETTE.textPrimary }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: stat.color, bgcolor: `${stat.color}15`, px: 1, py: 0.2, borderRadius: 1 }}>
                    {stat.trend}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DashboardPage;
