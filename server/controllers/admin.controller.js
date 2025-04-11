const AdminUser = require('../models/adminUser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// @route   POST api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
exports.loginAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    // Find the admin by username
    const admin = await AdminUser.findOne({ username });

    if (!admin) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // If credentials are valid, create and return JWT token
    const payload = {
      admin: {
        id: admin.id,
        role: admin.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '12h' },
      (err, token) => {
        if (err) throw err;
        
        // Return the token and admin info without the password
        const adminData = {
          id: admin._id,
          firstName: admin.firstName,
          lastName: admin.lastName,
          username: admin.username,
          email: admin.email,
          role: admin.role,
          phone: admin.phone
        };
        
        res.json({ token, admin: adminData });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @route   GET api/admin/me
// @desc    Get current admin profile
// @access  Private/Admin
exports.getAdminProfile = async (req, res) => {
  try {
    const admin = await AdminUser.findById(req.admin.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ msg: 'Admin not found' });
    }
    
    res.json(admin);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

exports.getAllHousekeepers = async (req, res) => {
  try {
    const housekeepers = await User.find({ userType: 'housekeeper' }).select('-password');
    res.json(housekeepers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHousekeeperDocuments = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Create a transformed version of the documents with proper URL structure
    const transformedDocuments = {};
    
    // Go through each document type
    for (const docType in user.verificationDocuments) {
      if (user.verificationDocuments[docType]) {
        transformedDocuments[docType] = {
          ...user.verificationDocuments[docType],
          files: user.verificationDocuments[docType].files.map(file => ({
            id: file.id,
            filename: file.filename,
            url: `/uploads/verification/${file.filename}`,  // Convert path to url
            uploadDate: file.uploadDate,
            mimetype: file.mimetype,
            verified: false  // Set default or get from elsewhere
          }))
        };
      }
    }
    
    // Return the transformed documents
    res.json({
      provider: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage,
        businessName: user.businessName,
        bio: user.bio,
        verificationStatus: user.verificationStatus
      },
      documents: transformedDocuments,
      history: user.verificationHistory || []
    });
  } catch (error) {
    console.error('Error getting provider documents:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 