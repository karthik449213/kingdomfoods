import Category from "../models/Category.js";
import Subcategory from "../models/subcategory.model.js";
import Dish from "../models/Dish.js";

// GET all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    // Ensure slug is present for all categories (generate if missing)
    const categoriesWithSlug = categories.map((cat) => {
      const catObj = cat.toObject();
      if (!catObj.slug) {
        catObj.slug = generateSlug(cat.name);
      }
      return catObj;
    });
    res.json(categoriesWithSlug);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories", error });
  }
};

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// CREATE a new category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Image is required" });
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

    const slug = generateSlug(name);
    const category = await Category.create({ name, slug, image: uploadResult.secure_url });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error creating category", error });
  }
};

// GET subcategories for a category
export const getSubcategories = async (req, res) => {
  try {
    const { categorySlug } = req.params;

    // resolve category by comparing slugified name
    const categories = await Category.find();
    const category = categories.find((c) => generateSlug(c.name) === categorySlug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const subcategories = await Subcategory.find({ category: category._id });
    const mappedSubcategories = subcategories.map((sub) => ({
      ...sub.toObject(),
      slug: generateSlug(sub.name),
    }));
    res.json(mappedSubcategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategories", error });
  }
};

// CREATE a new subcategory
export const createSubcategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { categorySlug } = req.params;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "Image is required" });
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

    const slug = generateSlug(name);
    const subcategory = await Subcategory.create({ name, slug, image: uploadResult.secure_url, category: category._id });
    res.status(201).json(subcategory);
  } catch (error) {
    res.status(500).json({ message: "Error creating subcategory", error });
  }
};

// GET dishes for a subcategory
export const getDishesForSubcategory = async (req, res) => {
  try {
    const { categorySlug, subcategorySlug } = req.params;

    // resolve category by slugified name
    const categories = await Category.find();
    const category = categories.find((c) => generateSlug(c.name) === categorySlug);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // resolve subcategory by slugified name scoped to category
    const subs = await Subcategory.find({ category: category._id });
    const subcategory = subs.find((s) => generateSlug(s.name) === subcategorySlug);
    if (!subcategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }

    const dishes = await Dish.find({ subcategory: subcategory._id });
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dishes", error });
  }
};
