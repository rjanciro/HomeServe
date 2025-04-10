import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaCalendarAlt, FaFileAlt } from 'react-icons/fa';

// Define types
interface HousekeeperReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}

interface Housekeeper {
  id: string;
  name: string;
  services: string[];
  hourlyRate: number;
  location: string;
  availability: string;
  rating: number;
  reviewCount: number;
  image?: string;
  bio?: string;
  certifications?: string[];
  reviews?: HousekeeperReview[];
}

interface BookingFormData {
  service: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  notes: string;
}

const OneTimeBooking: React.FC = () => {
  // State for housekeepers, filters, selected housekeeper for profile, booking
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
  const [filteredHousekeepers, setFilteredHousekeepers] = useState<Housekeeper[]>([]);
  const [selectedHousekeeper, setSelectedHousekeeper] = useState<Housekeeper | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    service: '',
    date: '',
    time: '',
    duration: 3,
    location: '123 Sample St, Quezon City',
    notes: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    serviceType: '',
    location: '',
    minRating: 0,
    maxPrice: 1000,
  });

  // Simulate fetching housekeepers
  useEffect(() => {
    // This would be replaced with an actual API call
    const mockHousekeepers: Housekeeper[] = [
      {
        id: '1',
        name: 'Maria Dela Cruz',
        services: ['Deep Cleaning', 'Regular Cleaning'],
        hourlyRate: 250,
        location: 'Quezon City',
        availability: 'Weekdays 9AM–6PM',
        rating: 4.9,
        reviewCount: 120,
        bio: 'Professional house cleaner with 5 years of experience. Specializes in deep cleaning and organization.',
        certifications: ['TESDA Certified', 'First Aid Trained'],
        reviews: [
          {
            id: 'r1',
            rating: 5,
            comment: 'Maria was thorough and efficient. My house has never been this clean!',
            reviewerName: 'Juan Reyes',
            date: 'March 15, 2025'
          },
          {
            id: 'r2',
            rating: 5,
            comment: 'Very professional and detail-oriented. Will book again!',
            reviewerName: 'Ana Santos',
            date: 'March 10, 2025'
          }
        ]
      },
      {
        id: '2',
        name: 'Jose Mendoza',
        services: ['Regular Cleaning', 'Laundry'],
        hourlyRate: 200,
        location: 'Makati City',
        availability: 'Everyday 8AM–9PM',
        rating: 4.7,
        reviewCount: 85,
        bio: 'Experienced housekeeper offering cleaning and laundry services. Friendly and reliable.',
        certifications: ['TESDA Certified'],
        reviews: [
          {
            id: 'r3',
            rating: 4,
            comment: 'Great service, just a bit late to arrive.',
            reviewerName: 'Carlos Tan',
            date: 'March 5, 2025'
          }
        ]
      },
      {
        id: '3',
        name: 'Angelica Reyes',
        services: ['Deep Cleaning', 'Organization', 'Laundry'],
        hourlyRate: 300,
        location: 'Quezon City',
        availability: 'Weekends only',
        rating: 4.8,
        reviewCount: 62,
        bio: 'Former hotel housekeeper with attention to detail. Specializes in deep cleaning and organization.',
        certifications: ['Hotel Housekeeping Certified', 'TESDA Certified'],
        reviews: [
          {
            id: 'r4',
            rating: 5,
            comment: 'The best cleaner I\'ve ever hired! Worth every peso.',
            reviewerName: 'Miguel Lopez',
            date: 'February 28, 2025'
          }
        ]
      },
      {
        id: '4',
        name: 'Ricardo Santos',
        services: ['Regular Cleaning', 'Gardening'],
        hourlyRate: 220,
        location: 'Pasig City',
        availability: 'Mon-Fri 7AM–3PM',
        rating: 4.5,
        reviewCount: 37,
        bio: 'Skilled in both indoor cleaning and outdoor maintenance. Can help with gardening and yard work.',
        certifications: ['Gardening Certified'],
        reviews: []
      }
    ];

    setHousekeepers(mockHousekeepers);
    setFilteredHousekeepers(mockHousekeepers);
  }, []);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...housekeepers];
    
    if (filters.serviceType) {
      filtered = filtered.filter(hk => 
        hk.services.some(s => s.toLowerCase().includes(filters.serviceType.toLowerCase()))
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(hk => 
        hk.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(hk => hk.rating >= filters.minRating);
    filtered = filtered.filter(hk => hk.hourlyRate <= filters.maxPrice);
    
    setFilteredHousekeepers(filtered);
  };

  // Effect to apply filters when they change
  useEffect(() => {
    applyFilters();
  }, [filters, housekeepers]);

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'minRating' || name === 'maxPrice' ? Number(value) : value
    }));
  };

  // Handle viewing profile
  const handleViewProfile = (housekeeper: Housekeeper) => {
    setSelectedHousekeeper(housekeeper);
    setShowProfile(true);
  };

  // Handle book now
  const handleBookNow = (housekeeper: Housekeeper) => {
    setSelectedHousekeeper(housekeeper);
    setBookingData(prev => ({
      ...prev,
      service: housekeeper.services[0] || '',
    }));
    setShowBookingForm(true);
  };

  // Handle booking form input changes
  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle booking submission
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Booking submitted! ${selectedHousekeeper?.name} will be notified.`);
    setShowBookingForm(false);
    // In a real app, you would submit this to your backend
    console.log('Booking data:', {
      housekeeper: selectedHousekeeper?.id,
      ...bookingData,
      estimatedPrice: calculateEstimatedPrice()
    });
  };

  // Calculate estimated price
  const calculateEstimatedPrice = () => {
    return selectedHousekeeper ? selectedHousekeeper.hourlyRate * bookingData.duration : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Find a Housekeeper</h1>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
            <select
              name="serviceType"
              value={filters.serviceType}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
            >
              <option value="">All Services</option>
              <option value="Deep Cleaning">Deep Cleaning</option>
              <option value="Regular Cleaning">Regular Cleaning</option>
              <option value="Laundry">Laundry</option>
              <option value="Organization">Organization</option>
              <option value="Gardening">Gardening</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              name="location"
              value={filters.location}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
            >
              <option value="">All Locations</option>
              <option value="Quezon City">Quezon City</option>
              <option value="Makati City">Makati City</option>
              <option value="Pasig City">Pasig City</option>
              <option value="Taguig City">Taguig City</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Rating</label>
            <select
              name="minRating"
              value={filters.minRating}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
            >
              <option value={0}>Any Rating</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={4.5}>4.5+ Stars</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (per hour)</label>
            <input
              type="range"
              name="maxPrice"
              min="100"
              max="500"
              step="50"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>₱100</span>
              <span>₱{filters.maxPrice}</span>
              <span>₱500</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Housekeepers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHousekeepers.map(housekeeper => (
          <div key={housekeeper.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="p-5">
              <div className="flex items-center mb-3">
                <div className="w-12 h-12 rounded-full bg-gray-300 mr-3 flex-shrink-0 overflow-hidden">
                  {housekeeper.image ? (
                    <img 
                      src={housekeeper.image} 
                      alt={housekeeper.name} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                      {housekeeper.name.charAt(0)}
                    </div>
                  )}
                </div>
                <h3 className="text-xl font-semibold">{housekeeper.name}</h3>
              </div>
              
              <p className="text-gray-700 mb-2">
                🧽 {housekeeper.services.join(', ')} | ₱{housekeeper.hourlyRate}/hr
              </p>
              
              <p className="flex items-center text-gray-600 mb-2">
                <FaMapMarkerAlt className="mr-1 text-gray-400" />
                {housekeeper.location} | Available: {housekeeper.availability}
              </p>
              
              <p className="flex items-center text-amber-500 mb-4">
                <FaStar className="mr-1" />
                {housekeeper.rating} ({housekeeper.reviewCount} reviews)
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleViewProfile(housekeeper)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 rounded flex items-center justify-center hover:bg-gray-200"
                >
                  <FaFileAlt className="mr-2" /> View Profile
                </button>
                <button
                  onClick={() => handleBookNow(housekeeper)}
                  className="flex-1 bg-[#133E87] text-white py-2 rounded flex items-center justify-center hover:bg-[#0f2f66]"
                >
                  <FaCalendarAlt className="mr-2" /> Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Profile Modal */}
      {showProfile && selectedHousekeeper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{selectedHousekeeper.name}'s Profile</h2>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-7rem)]">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="md:w-1/3">
                  <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto overflow-hidden">
                    {selectedHousekeeper.image ? (
                      <img 
                        src={selectedHousekeeper.image} 
                        alt={selectedHousekeeper.name} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-3xl font-bold">
                        {selectedHousekeeper.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className="flex items-center justify-center text-amber-500">
                      <FaStar className="mr-1" />
                      <span className="font-semibold">{selectedHousekeeper.rating}</span>
                      <span className="text-gray-600 ml-1">({selectedHousekeeper.reviewCount} reviews)</span>
                    </div>
                    <p className="text-gray-600 mt-2">{selectedHousekeeper.location}</p>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <h3 className="text-lg font-semibold mb-2">About</h3>
                  <p className="text-gray-700 mb-4">{selectedHousekeeper.bio}</p>
                  
                  <h3 className="text-lg font-semibold mb-2">Services & Rates</h3>
                  <ul className="mb-4">
                    {selectedHousekeeper.services.map(service => (
                      <li key={service} className="flex justify-between py-1 border-b border-gray-100">
                        <span>{service}</span>
                        <span className="font-semibold">₱{selectedHousekeeper.hourlyRate}/hour</span>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold mb-2">Availability</h3>
                  <p className="text-gray-700 mb-4">{selectedHousekeeper.availability}</p>
                  
                  {selectedHousekeeper.certifications && selectedHousekeeper.certifications.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedHousekeeper.certifications.map(cert => (
                          <span 
                            key={cert} 
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Reviews</h3>
                {!selectedHousekeeper.reviews || selectedHousekeeper.reviews.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No reviews yet</p>
                ) : (
                  <div className="space-y-4">
                    {selectedHousekeeper.reviews.map(review => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center mb-2">
                          <div className="flex text-amber-500 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={i < review.rating ? "text-amber-500" : "text-gray-300"} 
                              />
                            ))}
                          </div>
                          <span className="font-semibold">{review.reviewerName}</span>
                          <span className="text-gray-500 text-sm ml-2">• {review.date}</span>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowProfile(false);
                  handleBookNow(selectedHousekeeper);
                }}
                className="w-full bg-[#133E87] text-white py-2 rounded-lg hover:bg-[#0f2f66]"
              >
                Book {selectedHousekeeper.name}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Booking Form Modal */}
      {showBookingForm && selectedHousekeeper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Book {selectedHousekeeper.name}</h2>
                <button 
                  onClick={() => setShowBookingForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmitBooking}>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Requested</label>
                  <select
                    name="service"
                    value={bookingData.service}
                    onChange={handleBookingChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                  >
                    {selectedHousekeeper.services.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleBookingChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      name="time"
                      value={bookingData.time}
                      onChange={handleBookingChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <input
                    type="number"
                    name="duration"
                    value={bookingData.duration}
                    onChange={handleBookingChange}
                    min="1"
                    max="8"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={bookingData.location}
                    onChange={handleBookingChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={bookingData.notes}
                    onChange={handleBookingChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                    placeholder="Special instructions or details..."
                  ></textarea>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Estimated Price:</span>
                    <span className="text-xl text-[#133E87]">₱{calculateEstimatedPrice()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    (₱{selectedHousekeeper.hourlyRate} × {bookingData.duration} hours)
                  </p>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <button
                  type="submit"
                  className="w-full bg-[#133E87] text-white py-2 rounded-lg hover:bg-[#0f2f66]"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneTimeBooking;
