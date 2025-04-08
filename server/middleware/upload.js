const multer = require('multer');
const path = require('path');

// Set up storage for service images
const serviceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/services_pictures');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'service-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Set up multer for service images
const uploadServiceImage = multer({
  storage: serviceStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: imageFilter
}).single('serviceImage');

// Middleware wrapper for error handling
const serviceImageUpload = (req, res, next) => {
  uploadServiceImage(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ 
        message: err.message || 'Error uploading file' 
      });
    }
    console.log('File upload successful:', req.file);
    next();
  });
};

module.exports = {
  serviceImageUpload
};
