import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

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
