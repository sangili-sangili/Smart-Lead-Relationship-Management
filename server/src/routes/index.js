const express = require('express');
const healthRoutes = require('./healthRoutes');
const authRoutes = require('./authRoutes');
const leadRoutes = require('./leadRoutes');
const companyRoutes = require('./companyRoutes');
const taskRoutes = require('./taskRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const notificationRoutes = require('./notificationRoutes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/companies', companyRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
