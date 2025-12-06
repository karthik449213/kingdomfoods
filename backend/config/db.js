import mongoose from "mongoose";

const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        w: 'majority'
      });
      console.log('✓ MongoDB connected successfully');
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection attempt ${retries}/${maxRetries} failed:`, error.message);
      if (retries < maxRetries) {
        const delay = 2000 * retries; // Exponential backoff
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }
  throw new Error('Failed to connect to MongoDB after 5 attempts');
};

export default connectDB;
