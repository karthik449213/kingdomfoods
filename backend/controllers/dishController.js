import Dish from "../models/Dish.js";
import cloudinary from "../config/cloudinary.js";

// GET all dishes (public)
export const getDishes = async (req, res) => {
  try {
    const dishes = await Dish.find();
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dishes", error });
  }
};

// GET single dish by ID (public)
export const getDish = async (req, res) => {
  try {
    const { id } = req.params;
    const dish = await Dish.findById(id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (error) {
    res.status(500).json({ message: "Error fetching dish", error });
  }
};

// ADD DISH (admin only)
export const addDish = async (req, res) => {
  try {
    const { name, price, description, stars } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    const uploadResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "restaurant_menu",
    });

    const dish = new Dish({
      name,
      price,
      description,
      stars,
      image: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
    });

    await dish.save();
    res.status(201).json({ message: "Dish added successfully", dish });

  } catch (error) {
    res.status(500).json({ message: "Error adding dish", error });
  }
};

// UPDATE DISH (admin only)
export const updateDish = async (req, res) => {
  try {
    const dishId = req.params.id;
    const { name, price, description, category, stars } = req.body;

    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    // Update fields
    dish.name = name ?? dish.name;
    dish.price = price ?? dish.price;
    dish.description = description ?? dish.description;
    dish.category = category ?? dish.category;
    dish.stars = stars ?? dish.stars;

    // If new image uploaded
    if (req.file) {
      // delete old image
      await cloudinary.uploader.destroy(dish.imagePublicId);

      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "restaurant_menu",
      });

      dish.image = uploadResult.secure_url;
      dish.imagePublicId = uploadResult.public_id;
    }

    await dish.save();
    res.json({ message: "Dish updated successfully", dish });

  } catch (error) {
    res.status(500).json({ message: "Error updating dish", error });
  }
};

// DELETE DISH (admin only)
export const deleteDish = async (req, res) => {
  try {
    const dishId = req.params.id;

    const dish = await Dish.findById(dishId);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    // delete cloudinary image
    await cloudinary.uploader.destroy(dish.imagePublicId);

    await dish.deleteOne();
    res.json({ message: "Dish deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error deleting dish", error });
  }
};
