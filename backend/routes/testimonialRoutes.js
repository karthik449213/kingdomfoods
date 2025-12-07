import express from 'express';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/upload.js';
import {
  getApprovedTestimonials,
  getAllTestimonials,
  createTestimonial,
  approveTestimonial,
  rejectTestimonial,
  deleteTestimonial,
  updateTestimonial,
} from '../controllers/testimonialController.js';

const router = express.Router();

// Public routes
router.get('/approved', getApprovedTestimonials);
router.post('/submit', upload.single('profileImage'), createTestimonial);

// Admin protected routes
router.get('/all', adminAuth, getAllTestimonials);
router.put('/:id/approve', adminAuth, approveTestimonial);
router.put('/:id/reject', adminAuth, rejectTestimonial);
router.put('/:id', adminAuth, upload.single('profileImage'), updateTestimonial);
router.delete('/:id', adminAuth, deleteTestimonial);

export default router;
