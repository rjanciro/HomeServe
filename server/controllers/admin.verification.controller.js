const User = require('../models/user.model');

exports.getPendingProviders = async (req, res) => {
  try {
    const pendingProviders = await User.find({
      userType: 'provider',
      verificationStatus: 'pending'
    }).select('-password');
    
    res.json(pendingProviders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProviders = async (req, res) => {
  try {
    const providers = await User.find({
      userType: 'provider'
    }).select('-password');
    
    res.json(providers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyProvider = async (req, res) => {
  try {
    console.log('Verification request received:', req.body);
    
    const { userId, approved, notes, documentReview } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the user's verification status
    user.verificationStatus = approved ? 'approved' : 'rejected';
    
    // IMPORTANT: Also update the isVerified flag
    user.isVerified = approved;
    
    // Add to verification history
    user.verificationHistory = user.verificationHistory || [];
    user.verificationHistory.push({
      status: user.verificationStatus,
      date: new Date(),
      notes: notes || ''
    });
    
    await user.save();
    
    res.json({ 
      message: `Provider ${approved ? 'approved' : 'rejected'} successfully`,
      user: {
        _id: user._id,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Error in verifyProvider:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProviderDocuments = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.userType !== 'provider') {
      return res.status(400).json({ message: 'User is not a service provider' });
    }
    
    res.json({
      provider: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        verificationStatus: user.verificationStatus
      },
      documents: user.verificationDocuments || {},
      history: user.verificationHistory || []
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProviderStatus = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { isActive, notes } = req.body;
    
    if (!providerId) {
      return res.status(400).json({ message: 'Provider ID is required' });
    }
    
    const user = await User.findById(providerId);
    
    if (!user) {
      return res.status(404).json({ message: 'Provider not found' });
    }
    
    if (user.userType !== 'provider') {
      return res.status(400).json({ message: 'User is not a service provider' });
    }
    
    // Update the provider's active status
    user.isActive = isActive;
    user.statusNotes = notes;
    user.statusUpdateDate = new Date();
    
    // Add to status history
    user.statusHistory = user.statusHistory || [];
    user.statusHistory.push({
      status: isActive ? 'active' : 'disabled',
      date: new Date(),
      notes: notes || ''
    });
    
    await user.save();
    
    res.json({ 
      message: `Provider ${isActive ? 'enabled' : 'disabled'} successfully`,
      provider: {
        _id: user._id,
        isActive: user.isActive,
        statusNotes: user.statusNotes,
        statusUpdateDate: user.statusUpdateDate
      }
    });
  } catch (error) {
    console.error('Error updating provider status:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 