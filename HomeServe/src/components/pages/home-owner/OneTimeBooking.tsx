import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaStar, FaCalendarAlt, FaFileAlt, FaTools, FaMoneyBillWave, FaSpinner, FaTag, FaClock } from 'react-icons/fa';
import { Service } from '../../services/service.service';
import { browseService } from '../../services/browse.service';
import toast from 'react-hot-toast';
import { profileService } from '../../services/profile.service';

// Define types
interface HousekeeperReview {
  id: string;
  rating: number;
  comment: string;
  reviewerName: string;
  date: string;
}

export interface Housekeeper {
  id: string;
  name: string;
  location: string;
  availability: string;
  rating: number;
  reviewCount: number;
  image?: string;
  bio?: string;
  certifications?: string[];
  reviews?: HousekeeperReview[];
  services: Service[];
  isActive?: boolean;
}

interface BookingFormData {
  selectedServiceId: string;
  date: string;
  time: string;
  duration: number;
  location: string;
  notes: string;
  housekeeperId: string;
  housekeeperName: string;
}

const OneTimeBooking: React.FC = () => {
  // State for housekeepers, filters, selected housekeeper for profile, booking
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
  const [filteredHousekeepers, setFilteredHousekeepers] = useState<Housekeeper[]>([]);
  const [selectedHousekeeper, setSelectedHousekeeper] = useState<Housekeeper | null>(null);
  const [serviceToBook, setServiceToBook] = useState<Service | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    selectedServiceId: '',
    date: '',
    time: '',
    duration: 0,
    location: '123 Sample St, Quezon City',
    notes: '',
    housekeeperId: '',
    housekeeperName: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    serviceCategory: '',
    serviceName: '',
    location: '',
    minRating: 0,
    maxPrice: 5000,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get the full profile image URL
  // Option 1: Reuse from profileService if it exists and is suitable
  // const getProfileImageUrl = profileService.getFullImageUrl; 

  // Option 2: Define a local helper if profileService isn't available/suitable here
  const getProfileImageUrl = (imagePath: string | undefined): string => {
    const defaultImage = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    if (!imagePath) {
      return defaultImage;
    }
    // Assuming imagePath is like '/uploads/profile_pictures/...'
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    // Ensure no double slashes
    const fullUrl = `${apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    console.log("Constructed Profile Image URL:", fullUrl); // Log for debugging
    return fullUrl;
  };

  // Helper function for Service Image URL
  const getServiceImageUrl = (imagePath: string | undefined): string | null => {
    if (!imagePath) {
      return null; // No image path provided
    }
    // Assuming imagePath is like '/uploads/services_pictures/service-...'
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080'; 
    // Ensure no double slashes
    const fullUrl = `${apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    console.log("Constructed Service Image URL:", fullUrl); // Log for debugging
    return fullUrl;
  };

  // Fetch real data on component mount
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await browseService.getAvailableHousekeeperServices();
        console.log("Fetched housekeepers with services:", data);
        setHousekeepers(data);
        setFilteredHousekeepers(data);
      } catch (err) {
        console.error("Failed to fetch housekeeper services:", err);
        setError('Failed to load available services. Please try again later.');
        toast.error('Failed to load available services.');
        setHousekeepers([]);
        setFilteredHousekeepers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let filtered = [...housekeepers].filter(hk => hk.isActive);

    if (filters.serviceCategory) {
      filtered = filtered.filter(hk => 
        hk.services.some(s => s.category === filters.serviceCategory && s.isAvailable)
      );
    }

    if (filters.serviceName) {
        const query = filters.serviceName.toLowerCase();
        filtered = filtered.filter(hk => 
            hk.services.some(s => 
                (s.name.toLowerCase().includes(query) || 
                 (s.tags && s.tags.toLowerCase().includes(query))) && 
                s.isAvailable
            )
        );
    }

    if (filters.location) {
      filtered = filtered.filter(hk => 
        hk.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    filtered = filtered.filter(hk => hk.rating >= filters.minRating);
    
    filtered = filtered.filter(hk => 
        hk.services.some(s => s.price <= filters.maxPrice && s.isAvailable)
    );
    
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
  const handleBookNow = (housekeeper: Housekeeper, service: Service) => {
    if (!service.isAvailable) {
        alert("This specific service is currently unavailable.");
        return;
    }
    setSelectedHousekeeper(housekeeper);
    setServiceToBook(service);
    setBookingData(prev => ({
      ...prev,
      selectedServiceId: service._id || '',
      duration: 0,
      location: prev.location,
      notes: '',
      housekeeperId: housekeeper.id,
      housekeeperName: housekeeper.name,
    }));
    setShowBookingForm(true);
  };

  // Handle booking form input changes
  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value, 10) : value
    }));
  };

  // Handle booking submission
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceToBook || !selectedHousekeeper) return;

    alert(`Booking submitted for "${serviceToBook.name}" with ${selectedHousekeeper.name}.`);
    setShowBookingForm(false);
    // In a real app, you would submit this to your backend
    console.log('Booking data:', {
      housekeeperId: selectedHousekeeper.id,
      serviceId: serviceToBook._id,
      serviceName: serviceToBook.name,
      date: bookingData.date,
      time: bookingData.time,
      duration: bookingData.duration,
      location: bookingData.location,
      notes: bookingData.notes,
      price: serviceToBook.price,
    });
    setServiceToBook(null);
  };

  // Calculate estimated price
  const calculateEstimatedPrice = () => {
    return serviceToBook ? serviceToBook.price : 0;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-gray-800">Find a Housekeeper Service</h1>
      <p className="text-gray-600 mb-6">Browse available services and book directly.</p>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8 border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Filter Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Category</label>
            <select
              name="serviceCategory"
              value={filters.serviceCategory}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
            >
              <option value="">All Categories</option>
              <option value="General Cleaning">General Cleaning</option>
              <option value="Deep Cleaning">Deep Cleaning</option>
              <option value="Laundry & Ironing">Laundry & Ironing</option>
              <option value="Pet Services">Pet Services</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name / Keyword</label>
            <input
              type="text"
              name="serviceName"
              placeholder="e.g., Deep Clean, Pet, Garden"
              value={filters.serviceName}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
            />
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
          
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Price (Fixed Service)</label>
            <input
              type="range"
              name="maxPrice"
              min="500"
              max="10000"
              step="100"
              value={filters.maxPrice}
              onChange={handleFilterChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>₱500</span>
              <span>₱{filters.maxPrice}</span>
              <span>₱10000</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Housekeepers List */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <FaSpinner className="animate-spin text-4xl text-[#133E87]" />
          <p className="ml-3 text-gray-600">Loading services...</p>
        </div>
      ) : error ? (
         <div className="text-center py-10 text-red-600 bg-red-50 p-4 rounded border border-red-200">
           <p>{error}</p>
         </div>
      ) : filteredHousekeepers.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No housekeepers match the current filters.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredHousekeepers.map(housekeeper => (
            <div key={housekeeper.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 flex flex-col overflow-hidden">
              <div className="flex items-center p-4 gap-4 border-b border-gray-100">
                <img 
                    src={getProfileImageUrl(housekeeper.image)} 
                    alt={housekeeper.name} 
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"; }} 
                 />
                <div className="flex-grow">
                  <h3 
                    className="text-lg font-semibold text-gray-800 hover:text-[#133E87] cursor-pointer" 
                    onClick={() => handleViewProfile(housekeeper)}
                  >
                      {housekeeper.name}
                  </h3>
                  <div className="flex items-center text-gray-500 text-xs mt-1 space-x-3">
                      <span className='flex items-center'>
                          <FaMapMarkerAlt className="mr-1 text-gray-400" size={12}/>
                          {housekeeper.location || 'N/A'} 
                      </span>
                      <span className='flex items-center'>
                           <FaStar className="mr-1 text-amber-400" size={12}/>
                          {housekeeper.rating?.toFixed(1) || '0.0'} ({housekeeper.reviewCount || 0})
                      </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewProfile(housekeeper)}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Profile
                </button>
              </div>
              
              <div className="p-4 space-y-4 bg-gray-50/50 flex-grow"> 
                  {housekeeper.services.filter(s => s.isAvailable).length === 0 && (
                      <p className="text-sm text-center text-gray-500 italic py-4">No available services currently listed.</p>
                  )}
                  {housekeeper.services.filter(s => s.isAvailable).map((service) => {
                     const serviceImageUrl = getServiceImageUrl(service.image); 
                     return (
                       <div key={service._id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col">
                         {/* Image */}
                         {serviceImageUrl && (
                           <div className="w-full h-48 bg-gray-100 relative">
                             <img
                               src={serviceImageUrl} alt={service.name}
                               className="w-full h-full object-cover"
                               onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                             />
                             {/* Optional: Add a badge overlay, e.g., for Featured or Verified */}
                             {/* {housekeeper.certifications && housekeeper.certifications.length > 0 && (
                               <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">✔ Verified</span>
                             )} */}
                           </div>
                         )}
                       
                         {/* Content Area */}
                         <div className="p-4 flex flex-col flex-grow">

                           {/* Housekeeper Info (Moved Inside) */}
                           <div className="flex items-center mb-3 pb-3 border-b border-gray-100">
                             <img
                               src={getProfileImageUrl(housekeeper.image)}
                               alt={housekeeper.name}
                               className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                               onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"; }}
                             />
                             <div className="flex-grow">
                               <p className="text-sm font-semibold text-gray-800 leading-tight cursor-pointer hover:text-[#133E87]" onClick={() => handleViewProfile(housekeeper)}>{housekeeper.name}</p>
                               <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                 <FaStar className="text-amber-400 mr-1" size={12}/>
                                 {housekeeper.rating?.toFixed(1) || 'N/A'}
                                 <span className="ml-1">({housekeeper.reviewCount || 0} reviews)</span>
                               </div>
                             </div>
                             {/* Simple Verification Badge Example */}
                             {housekeeper.certifications && housekeeper.certifications.length > 0 && (
                                <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full ml-2">Verified</span>
                             )}
                           </div>

                           {/* Service Title */}
                           <h4 className="text-lg font-semibold text-gray-900 leading-tight mb-1.5">{service.name}</h4>
                       
                           {/* Tags/Badges (Category, Time) */}
                           <div className="flex items-center flex-wrap gap-2 text-xs mb-3">
                               <span className='inline-flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full'>
                                   <FaTag className="mr-1 text-gray-500" size={10}/> {service.category}
                               </span>
                               <span className='inline-flex items-center bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                                    <FaClock className="mr-1" size={10}/> {service.estimatedCompletionTime}
                               </span>
                           </div>
                       
                           {/* Short Description */}
                           {service.description && (
                               <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-2">{service.description}</p> // Added line-clamp
                           )}
                       
                           {/* Price & Location Row */}
                           <div className="flex justify-between items-center text-sm mb-4 mt-auto pt-3 border-t border-gray-100"> {/* Use mt-auto here */} 
                                <span className="flex items-center text-green-600 font-semibold text-base">
                                   <FaMoneyBillWave className="mr-1.5" />
                                   ₱{service.price}
                               </span>
                               <span className="flex items-center text-gray-500 text-xs" title={`Provider based in ${housekeeper.location}`}>
                                   <FaMapMarkerAlt className="mr-1 text-gray-400" size={12} />
                                   {housekeeper.location || 'Location N/A'}
                               </span>
                           </div>

                           {/* Action Button */}
                           <div> {/* Removed mt-auto from here */}
                              <button
                                 onClick={() => handleBookNow(housekeeper, service)}
                                 className="w-full bg-[#133E87] text-white px-4 py-2 rounded-md hover:bg-[#0f2f66] transition-colors font-semibold text-sm"
                             >
                                 Book Now
                             </button>
                           </div>
                         </div>
                       </div>
                     );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
      
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
                <div className="md:w-1/3 text-center">
                    <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto overflow-hidden mb-2">
                         <img 
                            src={getProfileImageUrl(selectedHousekeeper.image)} 
                            alt={selectedHousekeeper.name} 
                            className="w-full h-full object-cover" 
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"; }}
                         />
                    </div>
                     <div className="flex items-center justify-center text-amber-500">
                         <FaStar className="mr-1" />
                         <span className="font-semibold">{selectedHousekeeper.rating}</span>
                         <span className="text-gray-600 ml-1">({selectedHousekeeper.reviewCount} reviews)</span>
                     </div>
                     <p className="text-gray-600 mt-1 text-sm">{selectedHousekeeper.location}</p>
                 </div>
                 <div className="md:w-2/3">
                     <h3 className="text-lg font-semibold mb-1">About</h3>
                     <p className="text-gray-700 text-sm mb-4">{selectedHousekeeper.bio || "No bio provided."}</p>
                     
                     <h3 className="text-lg font-semibold mb-1">Availability</h3>
                     <p className="text-gray-700 text-sm mb-4">{selectedHousekeeper.availability}</p>
                     
                     {selectedHousekeeper.certifications && selectedHousekeeper.certifications.length > 0 && (
                         <h3 className="text-lg font-semibold mb-2">Certifications</h3>
                     )}
                     {selectedHousekeeper.certifications && selectedHousekeeper.certifications.map(cert => (
                         <span 
                            key={cert} 
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                         >
                            {cert}
                         </span>
                     ))}
                 </div>
               </div>

               <h3 className="text-lg font-semibold mb-2 border-t pt-4">Services</h3>
               <div className="space-y-2">
                 {selectedHousekeeper.services.filter(s => s.isAvailable).map(service => (
                   <div key={service._id} className="p-3 border rounded-md bg-gray-50">
                     <div className="flex justify-between items-center">
                         <div>
                             <p className="font-medium">{service.name}</p>
                             <p className="text-xs text-gray-500">{service.category} • {service.estimatedCompletionTime}</p>
                         </div>
                         <div className="text-right">
                              <p className="font-semibold text-lg text-[#133E87]">₱{service.price}</p>
                               <button
                                 onClick={() => { setShowProfile(false); handleBookNow(selectedHousekeeper, service); }}
                                 className="text-xs bg-[#133E87] text-white px-2 py-1 rounded hover:bg-[#0f2f66] mt-1"
                               >
                                 Book This
                               </button>
                         </div>
                     </div>
                     {service.description && <p className="text-sm text-gray-600 mt-1">{service.description}</p>}
                     {service.tags && <p className="text-xs text-gray-500 mt-1">Tags: {service.tags}</p>}
                   </div>
                 ))}
                  {selectedHousekeeper.services.filter(s => !s.isAvailable).length > 0 && (
                        <p className="text-sm text-gray-400 italic">Some services may be unavailable.</p>
                    )}
                  {selectedHousekeeper.services.length === 0 && (
                        <p className="text-sm text-gray-500">No services listed.</p>
                    )}
               </div>

               <div className="mt-6">
                 <h3 className="text-lg font-semibold mb-4 border-t pt-4">Reviews</h3>
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
          </div>
        </div>
      )}
      
      {/* Booking Form Modal */}
      {showBookingForm && selectedHousekeeper && serviceToBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold">Book Service</h2>
                 <button onClick={() => setShowBookingForm(false)} className="text-gray-500 hover:text-gray-700">✕</button>
               </div>
            </div>
            <form onSubmit={handleSubmitBooking}>
              <div className="p-6 max-h-[calc(90vh-10rem)] overflow-y-auto">
                 <div className="bg-blue-50 p-4 rounded-md mb-4 border border-blue-200">
                    <p className="font-medium text-blue-800">{serviceToBook.name}</p>
                    <p className="text-sm text-blue-700">By: {selectedHousekeeper.name}</p>
                    <p className="text-sm text-blue-700">{serviceToBook.category} • {serviceToBook.estimatedCompletionTime}</p>
                    <p className="text-lg font-semibold text-blue-900 mt-1">₱{serviceToBook.price}</p>
                 </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date*</label>
                    <input
                      type="date" name="date" value={bookingData.date} onChange={handleBookingChange} required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time*</label>
                    <input
                      type="time" name="time" value={bookingData.time} onChange={handleBookingChange} required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Location*</label>
                  <input
                    type="text" name="location" value={bookingData.location} onChange={handleBookingChange} required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                     placeholder="Your full address for the service"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes" value={bookingData.notes} onChange={handleBookingChange} rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#133E87]"
                    placeholder="Special instructions, e.g., 'Focus on the kitchen', 'We have a friendly dog'"
                  ></textarea>
                </div>
                
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                 <div className="flex justify-between items-center font-medium mb-2">
                     <span>Total Price:</span>
                     <span className="text-xl text-[#133E87]">₱{calculateEstimatedPrice()}</span>
                 </div>
                 <button type="submit" className="w-full bg-[#133E87] text-white py-2 rounded-lg hover:bg-[#0f2f66] font-semibold">
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
