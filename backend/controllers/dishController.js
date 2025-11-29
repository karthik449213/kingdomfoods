import cloudinary from "../config/cloudinary.js";
import Dish from "../models/Dish.js";

// Helper to upload a buffer to Cloudinary using upload_stream
const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "restaurant-menu", ...options },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });

export const createDish = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "name and price are required" });
    }

    let imageUrl = null;

    if (req.file && req.file.buffer) {
      const result = await uploadBufferToCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    }

    const dish = await Dish.create({
      name,
      price: Number(price),
      imageUrl,
    });

    return res.json({ success: true, dish });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
