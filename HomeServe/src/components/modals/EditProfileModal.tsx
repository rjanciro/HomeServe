import React, { useState, useEffect } from 'react';
import { FaTimes, FaSpinner } from 'react-icons/fa';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    houseNumber: string;
    streetName: string;
    barangay: string;
    cityMunicipality: string;
    province: string;
    zipCode: string;
    businessName: string;
    bio: string;
  };
  onSave: (data: EditProfileModalProps['formData']) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, formData, onSave }) => {
  const [editFormData, setEditFormData] = useState({ ...formData });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update local form data when parent formData changes
  useEffect(() => {
    if (isOpen) {
      setEditFormData({ ...formData });
    }
  }, [formData, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!editFormData.firstName || !editFormData.lastName || !editFormData.email) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(editFormData);
      // onClose is called by the parent component after successful save
    } catch (error) {
      console.error('Error saving profile:', error);
      // Error is handled by the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-300 bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-left">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                value={editFormData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-left">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
              <input
                id="lastName"
                type="text"
                name="lastName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                value={editFormData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-left">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address*</label>
              <input
                id="email"
                type="email"
                name="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                value={editFormData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="text-left">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                value={editFormData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <div className="text-left">
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              id="businessName"
              type="text"
              name="businessName"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              value={editFormData.businessName}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="text-left">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Address Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-left">
                <label htmlFor="houseNumber" className="block text-sm font-medium text-gray-700 mb-1">House/Building Number</label>
                <input
                  id="houseNumber"
                  type="text"
                  name="houseNumber"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={editFormData.houseNumber}
                  onChange={handleInputChange}
                />
              </div>
              <div className="text-left">
                <label htmlFor="streetName" className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
                <input
                  id="streetName"
                  type="text"
                  name="streetName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={editFormData.streetName}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="text-left">
                <label htmlFor="barangay" className="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <input
                  id="barangay"
                  type="text"
                  name="barangay"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={editFormData.barangay}
                  onChange={handleInputChange}
                />
              </div>
              <div className="text-left">
                <label htmlFor="cityMunicipality" className="block text-sm font-medium text-gray-700 mb-1">City/Municipality</label>
                <input
                  id="cityMunicipality"
                  type="text"
                  name="cityMunicipality"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={editFormData.cityMunicipality}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-left">
                <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <input
                  id="province"
                  type="text"
                  name="province"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={editFormData.province}
                  onChange={handleInputChange}
                />
              </div>
              <div className="text-left">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input
                  id="zipCode"
                  type="text"
                  name="zipCode"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  value={editFormData.zipCode}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <div className="text-left">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              id="bio"
              name="bio"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
              value={editFormData.bio}
              onChange={handleInputChange}
            ></textarea>
          </div>
          
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal; 