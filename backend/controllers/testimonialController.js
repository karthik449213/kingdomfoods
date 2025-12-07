import Testimonial from '../models/Testimonial.js';
import cloudinary from '../config/cloudinary.js';

// Get all approved testimonials
export const getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ approved: true })
      .sort({ createdAt: -1 })
      .lean();
    res.json(testimonials);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all testimonials (admin only)
export const getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json(testimonials);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Submit a new testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { name, review, rating } = req.body;

    if (!name || !review || !rating) {
      return res.status(400).json({ message: 'name, review, and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'rating must be between 1 and 5' });
    }

    let profileImage = null;
    let profileImagePublicId = null;

    // Upload profile image if provided
    if (req.file && req.file.buffer) {
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: 'Image too large (max 5MB)' });
      }

      try {
        const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
          folder: 'restaurant_testimonials/profiles',
          resource_type: 'auto',
          timeout: 30000,
        });
        profileImage = uploadResult.secure_url;
        profileImagePublicId = uploadResult.public_id;
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Failed to upload image', error: uploadErr.message });
      }
    }

    const testimonial = await Testimonial.create({
      name,
      review,
      rating: parseInt(rating),
      profileImage,
      profileImagePublicId,
      approved: false, // Default to pending approval
    });

    res.status(201).json(testimonial);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Approve a testimonial (admin only)
export const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { approved: true, updatedAt: new Date() },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Reject/unapprove a testimonial (admin only)
export const rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { approved: false, updatedAt: new Date() },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json(testimonial);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete a testimonial (admin only)
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findById(id);

    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    // Delete image from Cloudinary if it exists
    if (testimonial.profileImagePublicId) {
      try {
        await cloudinary.uploader.destroy(testimonial.profileImagePublicId);
      } catch (destroyErr) {
        console.error('Failed to delete image from Cloudinary:', destroyErr);
      }
    }

    await Testimonial.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update a testimonial (admin only)
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, review, rating, approved } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    if (name) testimonial.name = name;
    if (review) testimonial.review = review;
    if (rating) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'rating must be between 1 and 5' });
      }
      testimonial.rating = rating;
    }
    if (typeof approved === 'boolean') testimonial.approved = approved;

    // Handle profile image update
    if (req.file && req.file.buffer) {
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: 'Image too large (max 5MB)' });
      }

      // Delete old image
      if (testimonial.profileImagePublicId) {
        try {
          await cloudinary.uploader.destroy(testimonial.profileImagePublicId);
        } catch (destroyErr) {
          console.error('Failed to delete old image:', destroyErr);
        }
      }

      // Upload new image
      try {
        const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
          folder: 'restaurant_testimonials/profiles',
          resource_type: 'auto',
          timeout: 30000,
        });
        testimonial.profileImage = uploadResult.secure_url;
        testimonial.profileImagePublicId = uploadResult.public_id;
      } catch (uploadErr) {
        return res.status(500).json({ message: 'Failed to upload image', error: uploadErr.message });
      }
    }

    testimonial.updatedAt = new Date();
    await testimonial.save();
    res.json(testimonial);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
