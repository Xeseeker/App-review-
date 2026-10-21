const express = require('express');
const rateLimit = require('express-rate-limit');
const appController = require('../controllers/appController');
const analyticsController = require('../controllers/analyticsController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { validate } = require('../middleware/validateRequest');
const posterUpload = require('../middleware/upload');
const { appInput, appUpdate, listQuery, searchCode } = require('../schemas/appSchemas');
const { eventInput } = require('../schemas/eventSchemas');

const router = express.Router();
const publicLimiter = rateLimit({ windowMs: 60_000, limit: 100, standardHeaders: true, legacyHeaders: false, message: { error: { message: 'Too many requests. Please try again shortly.' } } });
const eventLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false, message: { error: { message: 'Too many event requests. Please try again shortly.' } } });

router.get('/search', publicLimiter, validate(require('zod').z.object({ code: searchCode }), 'query'), appController.searchApp);
router.get('/', publicLimiter, validate(listQuery, 'query'), appController.listApps);
router.get('/:id', publicLimiter, appController.getPublicApp);
router.post('/:id/events', eventLimiter, validate(eventInput, 'body'), analyticsController.recordEvent);

const admin = express.Router();
admin.use(authenticate, requireAdmin());
admin.get('/apps', appController.listAdminApps);
admin.get('/apps/:id', appController.getAdminApp);
admin.post('/apps', validate(appInput, 'body'), appController.createApp);
admin.put('/apps/:id', validate(appUpdate, 'body'), appController.updateApp);
admin.patch('/apps/:id/status', validate(require('zod').z.object({ status: require('zod').z.enum(['draft', 'published', 'unpublished']) }), 'body'), appController.updateStatus);
admin.delete('/apps/:id', requireAdmin(['admin']), appController.deleteApp);
admin.post('/apps/:id/poster', posterUpload, appController.uploadPoster);
admin.get('/dashboard', analyticsController.dashboard);
admin.get('/analytics', analyticsController.analytics);

module.exports = { appRouter: router, adminRouter: admin };
