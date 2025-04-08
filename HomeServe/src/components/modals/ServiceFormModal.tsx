import React, { useState, useEffect } from 'react';
import { FaSpinner, FaTimes } from 'react-icons/fa';
import { Service } from '../services/service.service';

// Define the props for the modal
interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentService: Service | null;
  onSave: (formData: any) => Promise<void>;
  submitting: boolean;
}

// Define available service categories
const serviceCategories = [
  'Plumbing',
  'Electrical',
  'Cleaning',
  'Carpentry',
  'HVAC',
  'Painting',
  'Landscaping',
  'Home Repair',
  'Appliance Repair',
  'Roofing',
  'Flooring',
  'Security',
  'Other'
];

const pricingTypes = ['Fixed', 'Hourly'];

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ 
  isOpen, 
  onClose, 
  currentService, 
  onSave,
  submitting 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    serviceLocation: '',
    availability: {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
      startTime: '09:00',
      endTime: '17:00'
    },
    estimatedCompletionTime: '',
    pricingType: 'Hourly' as 'Fixed' | 'Hourly',
    price: 0,
    isAvailable: true,
    image: '',
    contactNumber: ''
  });
  
  const [customCategory, setCustomCategory] = useState('');

  // Add new state for file handling
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Reset form when modal opens or currentService changes
  useEffect(() => {
    if (isOpen) {
      if (currentService) {
        setFormData({
          name: currentService.name,
          category: currentService.category,
          description: currentService.description,
          serviceLocation: currentService.serviceLocation,
          availability: currentService.availability,
          estimatedCompletionTime: currentService.estimatedCompletionTime,
          pricingType: currentService.pricingType,
          price: currentService.price,
          isAvailable: currentService.isAvailable,
          contactNumber: currentService.contactNumber,
          image: ''
        });
        
        if (currentService.image) {
          setImagePreview(`http://localhost:8080${currentService.image}`);
        } else {
          setImagePreview(null);
        }
        
        if (currentService.category && !serviceCategories.includes(currentService.category)) {
          setFormData(prev => ({ ...prev, category: 'Other' }));
          setCustomCategory(currentService.category);
        } else {
          setCustomCategory('');
        }
      } else {
        // Reset form for new service
        setFormData({
          name: '',
          category: '',
          description: '',
          serviceLocation: '',
          availability: {
            monday: false,
            tuesday: false,
            wednesday: false,
            thursday: false,
            friday: false,
            saturday: false,
            sunday: false,
            startTime: '09:00',
            endTime: '17:00'
          },
          estimatedCompletionTime: '',
          pricingType: 'Fixed',
          price: 0,
          isAvailable: true,
          contactNumber: '',
          image: ''
        });
        setCustomCategory('');
        setImagePreview(null);
      }
    }
  }, [isOpen, currentService]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'pricingType') {
      // Ensure pricingType is one of the allowed values
      const pricingType = value as 'Fixed' | 'Hourly';
      setFormData({
        ...formData,
        [name]: pricingType
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleAvailabilityChange = (day: string) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [day]: !formData.availability[day as keyof typeof formData.availability]
      }
    });
  };

  const handleTimeChange = (timeField: string, value: string) => {
    setFormData({
      ...formData,
      availability: {
        ...formData.availability,
        [timeField]: value
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a copy of form data with possibly modified category
    const submissionData = {
      ...formData,
      // If category is "Other" and customCategory is not empty, use customCategory
      category: formData.category === 'Other' && customCategory.trim() ? customCategory.trim() : formData.category
    };
    
    // Create FormData object for file upload
    const formDataWithFile = new FormData();
    
    // Add all the regular form fields
    Object.entries(submissionData).forEach(([key, value]) => {
      if (key === 'availability') {
        formDataWithFile.append(key, JSON.stringify(value));
      } else {
        formDataWithFile.append(key, value.toString());
      }
    });
    
    // Add the file if selected
    if (selectedFile) {
      formDataWithFile.append('serviceImage', selectedFile);
    }
    
    await onSave(formDataWithFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" 
        onClick={() => onClose()}
      ></div>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div 
          className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 mx-auto" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentService ? 'Edit Service' : 'Add New Service'}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={submitting}
            >
              <FaTimes size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Service Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Category*</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                >
                  <option value="">Select a category</option>
                  {serviceCategories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                
                {/* Show custom category input when "Other" is selected */}
                {formData.category === 'Other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={submitting}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Description*</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
                disabled={submitting}
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Service Location*</label>
              <input
                type="text"
                name="serviceLocation"
                value={formData.serviceLocation}
                onChange={handleFormChange}
                placeholder="City name or service radius (e.g., Manila or 10km from Makati)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
            
            {/* Availability Section */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Availability*</label>
              <div className="grid grid-cols-7 gap-2 mb-3">
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                  <div key={day} className="flex flex-col items-center">
                    <label className="text-xs text-gray-600 capitalize mb-1">{day.slice(0, 3)}</label>
                    <button
                      type="button"
                      onClick={() => handleAvailabilityChange(day)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        formData.availability[day as keyof typeof formData.availability]
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                      disabled={submitting}
                    >
                      {formData.availability[day as keyof typeof formData.availability] ? '✓' : '✗'}
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-xs mb-1">Start Time</label>
                  <input
                    type="time"
                    value={formData.availability.startTime}
                    onChange={(e) => handleTimeChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-xs mb-1">End Time</label>
                  <input
                    type="time"
                    value={formData.availability.endTime}
                    onChange={(e) => handleTimeChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={submitting}
                  />
                </div>
              </div>
            </div>
            
            {/* Estimated Completion Time */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Estimated Completion Time*</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-2">
                {['1-2 hours', '2-4 hours', 'Half day', 'Full day', '1-2 days', '3-5 days'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData({...formData, estimatedCompletionTime: option})}
                    className={`py-2 px-3 border rounded-lg text-sm transition-colors ${
                      formData.estimatedCompletionTime === option
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    disabled={submitting}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <input
                type="text"
                name="estimatedCompletionTime"
                value={formData.estimatedCompletionTime}
                onChange={handleFormChange}
                placeholder="Custom time estimate (e.g., 2-3 weeks)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={submitting}
              />
            </div>
            
            {/* Pricing Type and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Pricing Type*</label>
                <select
                  name="pricingType"
                  value={formData.pricingType}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                >
                  {pricingTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Price (₱)*
                  {formData.pricingType === 'Hourly' && ' (per hour)'}
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleFormChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={submitting}
                />
              </div>
            </div>
            
            {/* Contact Number */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Contact Number (Philippines)*</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">+63</span>
                </div>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber.startsWith('+63') ? formData.contactNumber.substring(3) : formData.contactNumber}
                  onChange={(e) => {
                    // Strip any non-numeric characters except for the leading +
                    const cleaned = e.target.value.replace(/[^\d]/g, '');
                    setFormData({
                      ...formData,
                      contactNumber: `+63${cleaned}`
                    });
                  }}
                  className="w-full pl-12 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9xx xxx xxxx"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  disabled={submitting}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Enter 10 digits without leading 0 (e.g., 9171234567)</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-1">Service Image</label>
              <div className="flex flex-col space-y-2">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-2 mb-4">
                    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                      <img 
                        src={imagePreview} 
                        alt="Service preview" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImagePreview(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  disabled={submitting}
                />
                
                <p className="text-xs text-gray-500">
                  Upload a high-quality image representing your service (JPG, PNG, max 5MB)
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={submitting}
                />
                <span className="ml-2 text-gray-700">Available for booking</span>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex justify-center items-center"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  currentService ? 'Save Changes' : 'Add Service'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceFormModal;