import express from 'express';
import { seedCategoriesAndSubcategories, clearCategoriesAndSubcategories } from '../controllers/seedController.js';

const router = express.Router();

// Seed endpoint - only available in development
router.post('/seed', seedCategoriesAndSubcategories);
router.post('/clear-seed', clearCategoriesAndSubcategories);

export default router;
