import mongoose from 'mongoose';

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  slug: {
    type: String,
    unique: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false, // Admin can hide subcategory from menu
  },
}, {
  timestamps: true,
});

// PERFORMANCE: Add indexes for frequently queried fields
// Note: unique: true already creates an index on slug
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ createdAt: -1 });

const SubCategory = mongoose.model('SubCategory', subCategorySchema);

export default SubCategory;
