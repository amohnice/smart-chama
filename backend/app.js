const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const memberRoutes = require('./routes/members');
const financeRoutes = require('./routes/finance');
const meetingRoutes = require('./routes/meetings');
const documentRoutes = require('./routes/documents');
const dashboardRoutes = require('./routes/dashboard');
const morgan = require('morgan');
const helmet = require('helmet');
const compression = require('compression');
const { errorHandler } = require('./middleware/errorHandler');
const adminRoutes = require('./routes/adminRoutes');
const loanRoutes = require('./routes/loanRoutes');
const contributionRoutes = require('./routes/contributionRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/contributions', contributionRoutes);

// Error handling middleware
app.use(errorHandler);

module.exports = app; 