import Category from "../models/category.model.js";
import SubCategory from "../models/SubCategory.js";
import Dish from "../models/dish.model.js";
import cloudinary, { uploadBuffer } from "../config/cloudinary.js";

// Helper to generate URL-friendly slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Helper function to upload buffer to Cloudinary using stream
const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });

    // Convert buffer to readable stream and pipe to Cloudinary
    Readable.from(buffer).pipe(stream);
  });
};

// CATEGORY CONTROLLERS
export const listCategories = async (req, res) => {
  try {
    // For public requests, exclude hidden categories. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    const query = isAdmin ? {} : { hidden: false };
    const categories = await Category.find(query).sort({ createdAt: -1 });
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

    // Validate file size (max 50MB)
    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(413).json({ message: "Image too large (max 50MB)" });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
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
      // Validate file size (max 50MB)
      if (req.file.size > 50 * 1024 * 1024) {
        return res.status(413).json({ message: "Image too large (max 50MB)" });
      }

      const uploadResult = await uploadBuffer(req.file.buffer, {
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

    // For public requests, exclude hidden dishes. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    const query = isAdmin ? {} : { hidden: false };

    const [dishes, total] = await Promise.all([
      Dish.find(query)
        .populate("subCategory", "name slug")
        .populate("category", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments(query)
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
    const { name, price, description, stars, subCategory, category } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: "name and price are required" });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "image is required" });
    }

    // Validate file size (max 50MB)
    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(413).json({ message: "Image too large (max 50MB)" });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder: "restaurant_menu/dishes",
      resource_type: 'auto',
      timeout: 30000
    });

    const dish = await Dish.create({
      name,
      price,
      description,
      // default to 5 stars when not provided; parse to number if provided as string
      stars: stars !== undefined ? (isNaN(Number(stars)) ? 5 : Number(stars)) : 5,
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      subCategory: subCategory || null,
      category: category || null,
    });

    res.status(201).json(dish);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stars, subCategory, category } = req.body;
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    if (name) dish.name = name;
    if (price !== undefined) dish.price = price;
    if (description !== undefined) dish.description = description;
    if (stars !== undefined) {
      const s = Number(stars);
      if (!isNaN(s)) dish.stars = s;
    }
    // allow clearing subCategory by passing empty string or null
    if (subCategory !== undefined) dish.subCategory = subCategory || null;
    if (category !== undefined) dish.category = category || null;

    if (req.file && req.file.buffer) {
      // Validate file size (max 50MB)
      if (req.file.size > 50 * 1024 * 1024) {
        return res.status(413).json({ message: "Image too large (max 50MB)" });
      }

      const oldImageId = dish.imagePublicId;

      // Upload new image
      const uploadResult = await uploadBuffer(req.file.buffer, {
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
    // For public requests, exclude hidden subcategories. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    const query = isAdmin ? {} : { hidden: false };
    const subCategories = await SubCategory.find(query).populate('category').sort({ createdAt: -1 });
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

    // Validate file size (max 50MB)
    if (req.file.size > 50 * 1024 * 1024) {
      return res.status(413).json({ message: "Image too large (max 50MB)" });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
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
      // Validate file size (max 50MB)
      if (req.file.size > 50 * 1024 * 1024) {
        return res.status(413).json({ message: "Image too large (max 50MB)" });
      }

      const uploadResult = await uploadBuffer(req.file.buffer, {
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

// Get full menu organized by categories and subcategories (simplified - only dishes with subcategories)
export const getFullMenu = async (req, res) => {
  try {
    // For public requests, exclude hidden items. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    
    // Fetch all data in parallel with just 3 queries
    const [categories, subCategories, dishes] = await Promise.all([
      Category.find(isAdmin ? {} : { hidden: false }).sort({ createdAt: -1 }).lean(),
      SubCategory.find(isAdmin ? {} : { hidden: false }).populate('category', 'name slug').sort({ createdAt: -1 }).lean(),
      Dish.find(isAdmin ? { subCategory: { $ne: null } } : { subCategory: { $ne: null }, hidden: false })  // Only dishes with subcategories
        .populate({ path: 'subCategory', select: 'name slug category', populate: { path: 'category', select: 'name slug' } })
        .sort({ createdAt: -1 })
        .lean()
    ]);

    // Organize data in-memory: categories > subcategories > dishes
    const menu = categories.map(cat => {
      const subs = subCategories
        .filter(subCat => subCat.category && subCat.category._id.equals(cat._id))
        .map(subCat => ({
          ...subCat,
          dishes: dishes.filter(dish => 
            dish.subCategory && dish.subCategory._id.equals(subCat._id)
          )
        }));

      return {
        ...cat,
        subCategories: subs
      };
    });
    
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

    // For public requests, exclude hidden items. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    const query = isAdmin ? { subCategory: null } : { subCategory: null, hidden: false };

    const [dishes, total] = await Promise.all([
      Dish.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments(query)
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

    // For public requests, exclude hidden items. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    const query = isAdmin ? { subCategory: { $ne: null } } : { subCategory: { $ne: null }, hidden: false };

    const [dishes, total] = await Promise.all([
      Dish.find(query)
        .populate({ path: 'subCategory', select: 'name slug category', populate: { path: 'category', select: 'name slug' } })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments(query)
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

    // For public requests, exclude hidden items. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');

    const [standalondDishes, categorizedDishes, standaloneTotal, categorizedTotal] = await Promise.all([
      Dish.find(isAdmin ? { subCategory: null } : { subCategory: null, hidden: false })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.find(isAdmin ? { subCategory: { $ne: null } } : { subCategory: { $ne: null }, hidden: false })
        .populate({ path: 'subCategory', select: 'name slug category', populate: { path: 'category', select: 'name slug' } })
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Dish.countDocuments(isAdmin ? { subCategory: null } : { subCategory: null, hidden: false }),
      Dish.countDocuments(isAdmin ? { subCategory: { $ne: null } } : { subCategory: { $ne: null }, hidden: false })
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

// Get dishes organized by Category > SubCategory > Dishes
export const getOrganizedMenu = async (req, res) => {
  try {
    // For public requests, exclude hidden items. For admin, include all.
    const isAdmin = req.headers.authorization && req.headers.authorization.includes('Bearer');
    
    const categories = await Category.find(isAdmin ? {} : { hidden: false }).sort({ createdAt: 1 });
    
    const organizedMenu = [];
    
    for (const category of categories) {
      const subCategories = await SubCategory.find(
        isAdmin 
          ? { category: category._id }
          : { category: category._id, hidden: false }
      );
      
      const categoryData = {
        _id: category._id,
        name: category.name,
        slug: category.slug,
        image: category.image,
        subCategories: []
      };
      
      for (const subCategory of subCategories) {
        const dishes = await Dish.find(
          isAdmin 
            ? { subCategory: subCategory._id }
            : { subCategory: subCategory._id, hidden: false }
        );
        
        categoryData.subCategories.push({
          _id: subCategory._id,
          name: subCategory.name,
          slug: subCategory.slug,
          image: subCategory.image,
          dishCount: dishes.length,
          dishes
        });
      }
      
      // Only add category if it has subcategories
      if (categoryData.subCategories.length > 0) {
        organizedMenu.push(categoryData);
      }
    }
    
    res.json({
      success: true,
      total: organizedMenu.reduce((sum, cat) => sum + cat.subCategories.reduce((subSum, sub) => subSum + sub.dishCount, 0), 0),
      categoriesCount: organizedMenu.length,
      data: organizedMenu
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Toggle category visibility
export const toggleCategoryVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    category.hidden = !category.hidden;
    await category.save();
    res.json({ success: true, hidden: category.hidden, message: `Category ${category.hidden ? 'hidden' : 'shown'}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Toggle subcategory visibility
export const toggleSubCategoryVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findById(id);
    if (!subCategory) return res.status(404).json({ message: "SubCategory not found" });

    subCategory.hidden = !subCategory.hidden;
    await subCategory.save();
    res.json({ success: true, hidden: subCategory.hidden, message: `SubCategory ${subCategory.hidden ? 'hidden' : 'shown'}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Toggle dish visibility
export const toggleDishVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    dish.hidden = !dish.hidden;
    await dish.save();
    res.json({ success: true, hidden: dish.hidden, message: `Dish ${dish.hidden ? 'hidden' : 'shown'}` });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all hidden categories (admin only)
export const getHiddenCategories = async (req, res) => {
  try {
    const categories = await Category.find({ hidden: true }).sort({ updatedAt: -1 });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all hidden subcategories (admin only)
export const getHiddenSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ hidden: true }).populate('category').sort({ updatedAt: -1 });
    res.json(subCategories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all hidden dishes (admin only)
export const getHiddenDishes = async (req, res) => {
  try {
    const dishes = await Dish.find({ hidden: true })
      .populate('subCategory', 'name slug')
      .populate('category', 'name slug')
      .sort({ updatedAt: -1 });
    res.json(dishes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
