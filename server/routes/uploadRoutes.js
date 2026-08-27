import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Multer in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Configure Cloudinary if credentials are present in env
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// @route   POST /api/upload
// @desc    Upload an image file (Cloudinary integration + DataURI fallback)
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // If Cloudinary credentials are set up, upload to Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'zaalima_products'
      });
      return res.status(200).json({
        success: true,
        message: 'Image uploaded to Cloudinary successfully',
        imageUrl: result.secure_url,
        url: result.secure_url
      });
    }

    // Otherwise, return base64 DataURI for instant preview rendering
    res.status(200).json({
      success: true,
      message: 'Image processed successfully',
      imageUrl: dataURI,
      url: dataURI
    });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
