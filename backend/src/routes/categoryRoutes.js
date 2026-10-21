const express = require('express');
const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/authenticate');
const requireAdmin = require('../middleware/requireAdmin');
const { validate } = require('../middleware/validateRequest');
const { categoryInput } = require('../schemas/appSchemas');

const categoryRouter = express.Router();
categoryRouter.get('/', categoryController.listCategories);

const adminCategoryRouter = express.Router();
adminCategoryRouter.use(authenticate, requireAdmin(['admin']));
adminCategoryRouter.post('/', validate(categoryInput, 'body'), categoryController.createCategory);
adminCategoryRouter.put('/:id', validate(categoryInput.partial(), 'body'), categoryController.updateCategory);
adminCategoryRouter.delete('/:id', categoryController.deleteCategory);

module.exports = { categoryRouter, adminCategoryRouter };
