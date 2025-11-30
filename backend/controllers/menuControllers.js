import Category from "../models/category.model.js";
import Subcategory from "../models/subcategory.model.js";
import Dish from "../models/dish.model.js";
import cloudinary from "../config/cloudinary.js";

// CATEGORY CONTROLLERS
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    let imageUrl = null;
    let imagePublicId = null;
    if (req.file) {
      const upload = await cloudinary.uploader.upload_stream;
    }

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

    const category = await Category.create({ name, image: uploadResult.secure_url });
    res.status(201).json(category);
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
    const subcatCount = await Subcategory.countDocuments({ category: id });
    if (subcatCount > 0) {
      return res.status(400).json({ message: "Delete subcategories first" });
    }
    await Category.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// SUBCATEGORY CONTROLLERS
export const listSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const subcats = await Subcategory.find(categoryId ? { category: categoryId } : {})
      .populate("category")
      .sort({ createdAt: -1 });
    res.json(subcats);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createSubcategory = async (req, res) => {
  try {
    const { name, categoryId } = req.body;
    if (!name || !categoryId) return res.status(400).json({ message: "name and categoryId are required" });

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

    const subcategory = await Subcategory.create({ name, image: uploadResult.secure_url, category: categoryId });
    res.status(201).json(subcategory);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId } = req.body;
    const sub = await Subcategory.findById(id);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });
    if (name) sub.name = name;
    if (categoryId) sub.category = categoryId;

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
      sub.image = uploadResult.secure_url;
    }

    await sub.save();
    res.json(sub);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const dishCount = await Dish.countDocuments({ subcategory: id });
    if (dishCount > 0) return res.status(400).json({ message: "Delete dishes first" });
    await Subcategory.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// DISH CONTROLLERS
export const listDishes = async (req, res) => {
  try {
    const dishes = await Dish.find()
      .populate({ path: "subcategory", populate: { path: "category" } })
      .sort({ createdAt: -1 });
    res.json(dishes);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const createDish = async (req, res) => {
  try {
    const { name, price, description, stars, subcategoryId } = req.body;
    if (!name || price === undefined || !subcategoryId) {
      return res.status(400).json({ message: "name, price, subcategoryId are required" });
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
      stars,
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      subcategory: subcategoryId,
    });

    res.status(201).json(dish);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateDish = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, stars, subcategoryId } = req.body;
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    if (name) dish.name = name;
    if (price !== undefined) dish.price = price;
    if (description !== undefined) dish.description = description;
    if (stars !== undefined) dish.stars = stars;
    if (subcategoryId) dish.subcategory = subcategoryId;

    if (req.file && req.file.buffer) {
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

// NESTED POPULATION: Category -> Subcategory -> Dish
export const getFullMenu = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate({
        path: "subcategories",
        populate: { path: "dishes" },
      });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
