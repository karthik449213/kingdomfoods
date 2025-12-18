import multer from "multer";

const storage = multer.memoryStorage();

// Increase limit to 50MB for large image uploads
export default multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});
