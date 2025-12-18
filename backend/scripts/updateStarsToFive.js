import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Dish from '../models/dish.model.js';

dotenv.config();

const run = async () => {
  try {
    await connectDB();
    console.log('Connected to DB — updating dish stars...');

    const res = await Dish.updateMany(
      { $or: [ { stars: { $exists: false } }, { stars: { $lt: 1 } } ] },
      { $set: { stars: 5 } }
    );

    console.log(`Matched ${res.matchedCount}, modified ${res.modifiedCount} documents.`);
    process.exit(0);
  } catch (err) {
    console.error('Error updating stars:', err);
    process.exit(1);
  }
};

run();
