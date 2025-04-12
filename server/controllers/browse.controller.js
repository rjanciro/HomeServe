const User = require('../models/user.model');
const Service = require('../models/service.model'); // Make sure you have this model created and imported

exports.getAvailableServicesWithHousekeepers = async (req, res) => {
  try {
    // Find active housekeepers
    const housekeepersData = await User.find({ 
        userType: 'housekeeper', 
        isActive: true 
    }).select('_id firstName lastName profileImage location rating reviewCount bio certifications availability isActive'); 

    if (!housekeepersData || housekeepersData.length === 0) {
      return res.json([]); 
    }

    const housekeeperIds = housekeepersData.map(hk => hk._id);

    // Find available services from these housekeepers
    const services = await Service.find({
      housekeeper: { $in: housekeeperIds },
      isAvailable: true 
    }).populate('housekeeper', '_id'); // Populate only ID, we have details already

    // Combine housekeeper data with their services
    const housekeepersWithServices = housekeepersData.map(hk => {
        const hkServices = services.filter(s => s.housekeeper._id.equals(hk._id)); 
        
        // Construct the object matching the frontend Housekeeper interface
        return {
            id: hk._id, 
            // Combine firstName and lastName into the expected 'name' field
            name: `${hk.firstName || ''} ${hk.lastName || ''}`.trim(), 
            location: hk.location,
            // Ensure availability is included, handle if potentially missing
            availability: hk.availability || 'Not specified', 
            rating: hk.rating || 0, 
            reviewCount: hk.reviewCount || 0, 
            image: hk.profileImage, // Map profileImage to image
            bio: hk.bio,
            certifications: hk.certifications,
            isActive: hk.isActive,
            // You might need to fetch reviews separately if required on this page
            reviews: [], // Defaulting to empty for now
            services: hkServices.map(s => ({
                // Spread service data and ensure 'id' field exists
                ...s.toObject(), 
                id: s._id 
            })) 
        };
    // Optionally filter out housekeepers with no available services AFTER mapping
    }).filter(hk => hk.services.length > 0); 

    res.json(housekeepersWithServices);

  } catch (error) {
    console.error('Error fetching available services:', error);
    res.status(500).json({ message: 'Server error fetching services' });
  }
}; 