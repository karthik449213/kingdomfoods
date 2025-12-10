import Dish from "../models/Dish.js";
import cloudinary, { uploadBuffer } from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

/**
 * BULK UPLOAD ENDPOINT
 * Accepts JSON array of dishes with local image paths
 * Uploads images to Cloudinary and saves to DB
 */
export const bulkUploadDishes = async (req, res) => {
  try {
    const { dishes } = req.body;

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ message: "Invalid input: dishes must be a non-empty array" });
    }

    const results = {
      success: [],
      failed: [],
      totalProcessed: 0,
    };

    for (const dishData of dishes) {
      results.totalProcessed++;

      try {
        const { name, price, description, category, image } = dishData;  // Changed: imagePath → image

        // Validate required fields
        if (!name || !price) {
          results.failed.push({
            dish: name || "Unknown",
            error: "Missing required fields: name and price",
          });
          continue;
        }

        let imageUrl = null;
        let imagePublicId = null;

        // Upload image if path provided
        if (image && image.trim()) {  // Changed: imagePath → image
          try {
            // Check if file exists
            if (!fs.existsSync(image)) {
              throw new Error(`Image file not found: ${image}`);
            }

            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(image, {  // Changed: imagePath → image
              folder: "restaurant_menu",
              resource_type: "auto",
              timeout: 30000,
            });

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
          } catch (imageError) {
            results.failed.push({
              dish: name,
              error: `Image upload failed: ${imageError.message}`,
            });
            continue;
          }
        }

        // Handle category: if it's not an ObjectId, store it as null (will use category endpoint later)
        let subCategoryId = null;
        if (category && category.trim()) {
          // Check if it looks like a MongoDB ObjectId
          if (mongoose.Types.ObjectId.isValid(category)) {
            subCategoryId = category;
          }
          // Otherwise, we skip it (can be added later via admin panel)
        }

        // Create and save dish
        const dish = new Dish({
          name: name.trim(),
          price: parseFloat(price),
          description: description || "",
          subCategory: subCategoryId, // Will be null if category is just a string name
          image: imageUrl || null, // Allow null if no image
          imagePublicId: imagePublicId || null,
          // Default to 5 stars for new dishes when not provided
          stars: 5,
        });

        await dish.save();

        results.success.push({
          dish: name,
          id: dish._id,
          image: imageUrl,
        });
      } catch (error) {
        results.failed.push({
          dish: dishData.name || "Unknown",
          error: error.message,
        });
      }
    }

    res.status(201).json({
      message: `Bulk upload completed. ${results.success.length} successful, ${results.failed.length} failed.`,
      results,
    });
  } catch (error) {
    console.error("Bulk upload error:", error);
    res.status(500).json({ message: "Bulk upload failed", error: error.message });
  }
};

/**
 * BULK UPLOAD WITH FILE UPLOAD
 * Accepts multipart form-data with dishes as JSON and images as files
 */
export const bulkUploadWithFiles = async (req, res) => {
  try {
    const { dishes: dishesJson } = req.body;
    const files = req.files || [];

    if (!dishesJson) {
      return res.status(400).json({ message: "Missing dishes data" });
    }

    let dishes;
    try {
      dishes = typeof dishesJson === "string" ? JSON.parse(dishesJson) : dishesJson;
    } catch (e) {
      return res.status(400).json({ message: "Invalid JSON in dishes field" });
    }

    if (!Array.isArray(dishes) || dishes.length === 0) {
      return res.status(400).json({ message: "Dishes must be a non-empty array" });
    }

    const results = {
      success: [],
      failed: [],
      totalProcessed: 0,
    };

    // Create a map of files by field name for easy lookup
    const fileMap = {};
    files.forEach((file) => {
      fileMap[file.fieldname] = file;
    });

    for (let i = 0; i < dishes.length; i++) {
      const dishData = dishes[i];
      results.totalProcessed++;

      try {
        const { name, price, description, category } = dishData;

        // Validate required fields
        if (!name || !price) {
          results.failed.push({
            dish: name || "Unknown",
            error: "Missing required fields: name and price",
          });
          continue;
        }

        let imageUrl = null;
        let imagePublicId = null;

        // Look for uploaded image
        const imageFieldName = `image_${i}`;
        const imageFile = fileMap[imageFieldName];

        if (imageFile) {
          try {
            const uploadResult = await uploadBuffer(imageFile.buffer, {
              folder: "restaurant_menu",
              resource_type: "auto",
              timeout: 30000,
            });

            imageUrl = uploadResult.secure_url;
            imagePublicId = uploadResult.public_id;
          } catch (imageError) {
            results.failed.push({
              dish: name,
              error: `Image upload failed: ${imageError.message}`,
            });
            continue;
          }
        }

        // Create and save dish
        const dish = new Dish({
          name: name.trim(),
          price: parseFloat(price),
          description: description || "",
          subCategory: category || null,
          image: imageUrl,
          imagePublicId: imagePublicId,
          // Default to 5 stars for new dishes when not provided
          stars: 5,
        });

        await dish.save();

        results.success.push({
          dish: name,
          id: dish._id,
          image: imageUrl,
        });
      } catch (error) {
        results.failed.push({
          dish: dishData.name || "Unknown",
          error: error.message,
        });
      }
    }

    res.status(201).json({
      message: `Bulk upload completed. ${results.success.length} successful, ${results.failed.length} failed.`,
      results,
    });
  } catch (error) {
    console.error("Bulk upload with files error:", error);
    res.status(500).json({ message: "Bulk upload failed", error: error.message });
  }
};
