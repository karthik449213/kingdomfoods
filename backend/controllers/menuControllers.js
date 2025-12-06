import Category from "../models/category.model.js";
import SubCategory from "../models/SubCategory.js";
import Dish from "../models/dish.model.js";
import cloudinary from "../config/cloudinary.js";

// Helper to generate URL-friendly slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// CATEGORY CONTROLLERS
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ message: e.message, error: {} });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "image is required" });
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(413).json({ message: "Image too large (max 5MB)" });
    }

    const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
      folder: "restaurant_menu/categories",
      resource_type: 'auto',
      timeout: 30000
    });

    // generate slug and create category
    const slug = generateSlug(name || '');
    try {
      const category = await Category.create({ name, slug, image: uploadResult.secure_url });
      return res.status(201).json(category);
    } catch (dbErr) {
      // If DB insert failed, remove uploaded image from Cloudinary to avoid orphaned files
      try {
        if (uploadResult && uploadResult.public_id) {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        }
      } catch (destroyErr) {
        // Cleanup error - continue anyway
      }
      // If duplicate slug (null or same), return a clear error
      if (dbErr && dbErr.code === 11000) {
        return res.status(409).json({ message: 'Category with this slug already exists', error: dbErr.message });
      }
      return res.status(500).json({ message: dbErr.message || 'Error creating category', error: dbErr });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    if (name) category.name = name;

    if (req.file && req.file.buffer) {
      // Validate file size
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: "Image too large (max 5MB)" });
      }

      const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
        folder: "restaurant_menu/categories",
        resource_type: 'auto',
        timeout: 30000
      });
      category.image = uploadResult.secure_url;
    }

    await category.save();
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategoryCount = await SubCategory.countDocuments({ category: id });
    if (subCategoryCount > 0) {
      return res.status(400).json({ message: "Delete all subcategories in this category first" });
    }
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DISH CONTROLLERS
export const listDishes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [dishes, total] = await Promise.all([
      Dish.find()
        .populate("subCategory", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments()
    ]);

    res.json({
      dishes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createDish = async (req, res) => {
  try {
    const { name, price, description, stars, subCategory } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "image is required" });
    }

    // Validate file size (max 5MB)
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(413).json({ message: "Image too large (max 5MB)" });
    }

    const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
      folder: "restaurant_menu/dishes",
      resource_type: 'auto',
      timeout: 30000
    });

    const dish = await Dish.create({
      name,
      price,
      description,
      stars: stars || 0,
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      subCategory,
    });

    res.status(201).json(dish);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stars, subCategory } = req.body;
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    if (name) dish.name = name;
    if (price !== undefined) dish.price = price;
    if (description !== undefined) dish.description = description;
    if (stars !== undefined) dish.stars = stars;
    if (subCategory) dish.subCategory = subCategory;

    if (req.file && req.file.buffer) {
      // Validate file size
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: "Image too large (max 5MB)" });
      }

      const oldImageId = dish.imagePublicId;

      // Upload new image
      const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
        folder: "restaurant_menu/dishes",
        resource_type: 'auto',
        timeout: 30000
      });
      dish.image = uploadResult.secure_url;
      dish.imagePublicId = uploadResult.public_id;

      // Delete old image in background (don't wait for it)
      if (oldImageId) {
        cloudinary.uploader.destroy(oldImageId).catch(err => {
          console.error('Background cleanup error:', err);
        });
      }
    }

    await dish.save();
    res.json(dish);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteDish = async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    if (dish.imagePublicId) {
      try { await cloudinary.uploader.destroy(dish.imagePublicId); } catch (e) { /* ignore */ }
    }

    await dish.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// SUBCATEGORY CONTROLLERS
export const listSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find().populate('category').sort({ createdAt: -1 });
    res.json(subCategories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createSubCategory = async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !category) return res.status(400).json({ message: "name and category are required" });

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "image is required" });
    }

    // Validate file size
    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(413).json({ message: "Image too large (max 5MB)" });
    }

    const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
      folder: "restaurant_menu/subcategories",
      resource_type: 'auto',
      timeout: 30000
    });

    // generate slug and create subcategory
    const slug = generateSlug(name || '');
    try {
      const subCategory = await SubCategory.create({ name, slug, image: uploadResult.secure_url, category });
      return res.status(201).json(subCategory);
    } catch (dbErr) {
      // If DB insert failed, remove uploaded image from Cloudinary to avoid orphaned files
      try {
        if (uploadResult && uploadResult.public_id) {
          await cloudinary.uploader.destroy(uploadResult.public_id);
        }
      } catch (destroyErr) {
        // Cleanup error - continue anyway
      }
      // If duplicate slug (null or same), return a clear error
      if (dbErr && dbErr.code === 11000) {
        return res.status(409).json({ message: 'SubCategory with this slug already exists', error: dbErr.message });
      }
      return res.status(500).json({ message: dbErr.message || 'Error creating subcategory', error: dbErr });
    }
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    if (name) subCategory.name = name;
    if (category) subCategory.category = category;

    if (req.file && req.file.buffer) {
      // Validate file size
      if (req.file.size > 5 * 1024 * 1024) {
        return res.status(413).json({ message: "Image too large (max 5MB)" });
      }

      const uploadResult = await cloudinary.uploader.upload_buffer(req.file.buffer, {
        folder: "restaurant_menu/subcategories",
        resource_type: 'auto',
        timeout: 30000
      });
      subCategory.image = uploadResult.secure_url;
    }

    await subCategory.save();
    res.json(subCategory);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const dishCount = await Dish.countDocuments({ subCategory: id });
    if (dishCount > 0) {
      return res.status(400).json({ message: "Delete all dishes in this subcategory first" });
    }
    await SubCategory.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get full menu organized by categories and subcategories
// OPTIMIZED: Reduced N+1 queries to just 3 queries total
export const getFullMenu = async (req, res) => {
  try {
    // Fetch all data in parallel with just 3 queries
    const [categories, subCategories, dishes] = await Promise.all([
      Category.find().sort({ createdAt: -1 }).lean(),
      SubCategory.find().populate('category', 'name slug').sort({ createdAt: -1 }).lean(),
      Dish.find().populate('subCategory', 'name slug').sort({ createdAt: -1 }).lean()
    ]);

    // Organize data in-memory (very fast)
    const menu = categories.map(cat => ({
      ...cat,
      subCategories: subCategories
        .filter(subCat => subCat.category && subCat.category._id.equals(cat._id))
        .map(subCat => ({
          ...subCat,
          dishes: dishes.filter(dish => 
            dish.subCategory && dish.subCategory._id.equals(subCat._id)
          )
        }))
    }));
    
    res.json(menu);
  } catch (e) {
    res.status(500).json({ message: e.message, error: {} });
  }
};

// Get dishes with no subcategory (standalone dishes)
export const getDishesByNoSubcategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [dishes, total] = await Promise.all([
      Dish.find({ subCategory: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments({ subCategory: null })
    ]);

    res.json({
      dishes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        type: 'standalone'
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get dishes organized by subcategory (with subcategory filtering)
export const getDishesBySubcategory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [dishes, total] = await Promise.all([
      Dish.find({ subCategory: { $ne: null } })
        .populate('subCategory', 'name slug category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments({ subCategory: { $ne: null } })
    ]);

    res.json({
      dishes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        type: 'categorized'
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all dishes (both with and without subcategory)
export const getAllDishesOrganized = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [standalondDishes, categorizedDishes, standaloneTotal, categorizedTotal] = await Promise.all([
      Dish.find({ subCategory: null })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.find({ subCategory: { $ne: null } })
        .populate('subCategory', 'name slug category')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments({ subCategory: null }),
      Dish.countDocuments({ subCategory: { $ne: null } })
    ]);

    res.json({
      standalone: {
        dishes: standalondDishes,
        total: standaloneTotal,
        pagination: {
          page,
          limit,
          pages: Math.ceil(standaloneTotal / limit)
        }
      },
      categorized: {
        dishes: categorizedDishes,
        total: categorizedTotal,
        pagination: {
          page,
          limit,
          pages: Math.ceil(categorizedTotal / limit)
        }
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
