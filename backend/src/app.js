const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { appRouter, adminRouter } = require('./routes/appRoutes');
const { categoryRouter, adminCategoryRouter } = require('./routes/categoryRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const allowedOrigins = (process.env.ADMIN_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
app.use(helmet());
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); callback(new Error('Origin is not allowed by CORS.')); }, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type', 'Authorization'] }));
app.use(express.json({ limit: '200kb' }));
app.use(rateLimit({ windowMs: 15 * 60_000, limit: 500, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (request, response) => response.json({ status: 'ok', app: 'Appora API' }));
app.use('/api/apps', appRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/categories', adminCategoryRouter);
app.use((request, response) => response.status(404).json({ error: { message: 'Route not found.' } }));
app.use(errorHandler);

module.exports = app;
