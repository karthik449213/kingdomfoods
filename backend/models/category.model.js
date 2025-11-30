import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true },
    image: { type: String, required: true }, // Cloudinary URL
  },
  { timestamps: true }
);

// Helpful virtual population if needed later
CategorySchema.virtual("subcategories", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "category",
});

CategorySchema.set("toJSON", { virtuals: true });
CategorySchema.set("toObject", { virtuals: true });

const Category = mongoose.model("Category", CategorySchema);
export default Category;
