import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { COLOR_PALETTE } from '../constants/statusColors';

const TasksPage = () => {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: COLOR_PALETTE.textPrimary }}>
          Tasks
        </Typography>
        <Typography variant="body2" sx={{ color: COLOR_PALETTE.textSecondary }}>
          Manage your schedule and task status updates (assignee-only permission).
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 3, border: `1px solid ${COLOR_PALETTE.border}` }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: COLOR_PALETTE.textSecondary }}>
            Tasks routing foundation configured. Strict assignee-only status updates and task creation will be implemented in Prompt 7.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TasksPage;
