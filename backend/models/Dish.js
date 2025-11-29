import mongoose from "mongoose";

const DishSchema = new mongoose.Schema({
  name: String,
  price: Number,
  imageUrl: String,
});

const Dish= mongoose.model("Dish", DishSchema);
export  default Dish;