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
    console.error('createSubCategory - unexpected error:', e);
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

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "restaurant_menu/categories" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
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
        console.error('Failed to cleanup Cloudinary image after DB error:', destroyErr);
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
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_menu/categories" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
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
    const dishes = await Dish.find()
      .populate("subCategory")
      .sort({ createdAt: -1 });
    res.json(dishes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createDish = async (req, res) => {
  try {
    const { name, price, description, stars, subCategory } = req.body;
    if (!name || price === undefined || !subCategory) {
      return res.status(400).json({ message: "name, price, subCategory are required" });
    }
    if (!req.file || !req.file.buffer) return res.status(400).json({ message: "image is required" });

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "restaurant_menu/dishes" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
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
      // Delete old image from Cloudinary if it exists
      if (dish.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(dish.imagePublicId);
        } catch (e) {
          console.log("Could not delete old image from Cloudinary:", e);
        }
      }

      // Upload new image
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_menu/dishes" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      dish.image = uploadResult.secure_url;
      dish.imagePublicId = uploadResult.public_id;
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

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "restaurant_menu/subcategories" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
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
        console.error('Failed to cleanup Cloudinary image after DB error:', destroyErr);
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
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_menu/subcategories" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
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
export const getFullMenu = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    const menu = await Promise.all(
      categories.map(async (cat) => {
        const subCategories = await SubCategory.find({ category: cat._id }).sort({ createdAt: -1 });
        const subCategoriesWithDishes = await Promise.all(
          subCategories.map(async (subCat) => {
            const dishes = await Dish.find({ subCategory: subCat._id }).sort({ createdAt: -1 });
            return {
              ...subCat.toObject(),
              dishes,
            };
          })
        );
        return {
          ...cat.toObject(),
          subCategories: subCategoriesWithDishes,
        };
      })
    );
    res.json(menu);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
