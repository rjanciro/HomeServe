import React, { useState, useEffect } from 'react';
import { FaSearch, FaTools, FaBolt, FaTint, FaBroom, FaWrench, FaPaintRoller, FaStar, FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { serviceService } from '../../services/service.service';
import { profileService } from '../../services/profile.service';
import BookingModal from '../../modals/BookingModal';
import ServiceDetailsModal from '../../modals/ServiceDetailsModal';
import toast from 'react-hot-toast';

interface ServiceProvider {
  id: string;
  _id?: string;
  providerId?: string;
  name: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  image: string;
  category: string;
  description: string;
  serviceLocation: string;
  providerName: string;
  businessName?: string;
  contactNumber?: string;
  estimatedCompletionTime?: string;
  pricingType: string;
  // Add any additional fields you need
}

interface Category {
  icon: React.ComponentType;
  name: string;
  providers: ServiceProvider[];
}

const ServiceProviderCard: React.FC<ServiceProvider> = (provider) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Truncate description if it's too long
  const shortDescription = provider.description.length > 100 
    ? `${provider.description.substring(0, 100)}...` 
    : provider.description;

  return (
    <>
      <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
        {/* Image and Category Tag */}
        <div className="relative">
          <img 
            src={provider.image} 
            alt={provider.name} 
            className="w-full h-48 rounded-lg object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300';
            }} 
          />
          <span className="absolute top-3 right-3 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {provider.category}
          </span>
        </div>
        
        {/* Service Name and Provider */}
        <div className="mt-4">
          <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            by <span className="font-medium">{provider.providerName}</span>
            {provider.businessName && ` (${provider.businessName})`}
          </p>
        </div>
        
        {/* Location */}
        <div className="flex items-center mt-3 text-sm text-gray-600">
          <FaMapMarkerAlt className="mr-1 text-gray-400" />
          <span>{provider.serviceLocation}</span>
        </div>
        
        {/* Description */}
        <div className="mt-3">
          <p className="text-gray-700 text-sm">
            {showFullDescription ? provider.description : shortDescription}
            {provider.description.length > 100 && (
              <button 
                className="ml-1 text-green-600 hover:text-green-700 text-sm font-medium"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        </div>
        
        {/* Pricing and Estimated Time */}
        <div className="flex flex-wrap items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <div>
            <span className="text-green-600 font-semibold text-lg">
              ${provider.hourlyRate}
              {provider.pricingType === 'Hourly' ? '/hr' : ''}
            </span>
            <span className="text-gray-500 text-xs ml-1">
              ({provider.pricingType})
            </span>
          </div>
          {provider.estimatedCompletionTime && (
            <span className="text-sm text-gray-600">
              Est. time: {provider.estimatedCompletionTime}
            </span>
          )}
        </div>
        
        {/* Ratings and Reviews */}
        <div className="flex items-center mt-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={`w-4 h-4 ${i < provider.rating ? 'text-yellow-400' : 'text-gray-200'}`} />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({provider.reviews} reviews)</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button 
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            onClick={() => setIsBookingModalOpen(true)}
          >
            Book Now
          </button>
          <button 
            className="flex-1 px-4 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
            onClick={() => setIsDetailsModalOpen(true)}
          >
            View Details
          </button>
        </div>
        
        {/* Contact Info (Optional) */}
        {/* {provider.contactNumber && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
            <p>Contact: {provider.contactNumber}</p>
          </div>
        )} */}
      </div>
      
      {/* Modals */}
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        provider={provider}
      />
      
      <ServiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        provider={provider}
        onBookNow={() => {
          setIsDetailsModalOpen(false);
          setIsBookingModalOpen(true);
        }}
      />
    </>
  );
};

const FindServicesPage: React.FC = () => {
  useDocumentTitle('Find Services');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);

  // Fetch services from the backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const data = await serviceService.getAllServices();
        console.log('Raw service data:', data);
        
        if (data.length === 0) {
          console.log('No services returned from API');
          setServices([]);
          setCategories([]);
          setLoading(false);
          return;
        }
        
        // Transform the data to match our component's expected format
        const transformedServices = data.map((service: any) => {
          console.log('Processing service:', service);
          return {
            id: service._id,
            _id: service._id,
            providerId: service.provider?._id,
            name: service.name || 'Unnamed Service',
            rating: 4.5, // Default rating since we don't have ratings yet
            reviews: Math.floor(Math.random() * 100) + 10, // Random reviews count for now
            hourlyRate: service.pricingType === 'Hourly' ? service.price : service.price,
            image: service.image 
              ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${service.image}`
              : service.provider?.profileImage 
                ? profileService.getFullImageUrl(service.provider.profileImage) 
                : 'https://via.placeholder.com/150',
            category: service.category || 'Uncategorized',
            description: service.description || 'No description available',
            serviceLocation: service.serviceLocation || 'Not specified',
            providerName: service.provider ? 
              `${service.provider.firstName || ''} ${service.provider.lastName || ''}`.trim() || 'Unknown Provider' 
              : 'Unknown Provider',
            businessName: service.provider?.businessName || '',
            contactNumber: service.contactNumber || '',
            estimatedCompletionTime: service.estimatedCompletionTime || '',
            pricingType: service.pricingType || 'Fixed'
          };
        });
        
        console.log('Transformed services:', transformedServices);
        
        setServices(transformedServices);
        
        // Group services by category
        const serviceCategories = transformedServices.reduce((acc: any, service: any) => {
          if (!acc[service.category]) {
            acc[service.category] = [];
          }
          acc[service.category].push(service);
          return acc;
        }, {});
        
        // Map categories to our expected format
        const categoryIcons: {[key: string]: React.ComponentType} = {
          'General Maintenance': FaWrench,
          'Plumbing': FaTint,
          'Electrical': FaBolt,
          'Cleaning': FaBroom,
          'Painting': FaPaintRoller,
          // Add more mappings as needed
        };
        
        const formattedCategories = Object.keys(serviceCategories).map(categoryName => ({
          icon: categoryIcons[categoryName] || FaTools, // Default to FaTools if no specific icon
          name: categoryName,
          providers: serviceCategories[categoryName]
        }));
        
        setCategories(formattedCategories);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
        setLoading(false);
      }
    };
    
    fetchServices();
  }, []);

  const filteredProviders = services.filter(provider => 
    (selectedCategory === 'all' || provider.category === selectedCategory) &&
    (provider.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     provider.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Find Services</h1>
        <p className="text-gray-600">Browse and book from our wide range of professional services</p>
      </div>

      <div className="flex space-x-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search service providers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>
        <select
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category.name} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => (
            <ServiceProviderCard key={provider.id} {...provider} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FindServicesPage; 