import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaCalendarTimes, FaClipboardCheck, FaClock, FaMapMarkerAlt, FaUser, FaSpinner, FaInfoCircle, FaPhone, FaCommentAlt } from 'react-icons/fa';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import axios from 'axios';
import { getAuthHeader } from '../../utils/auth';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { profileService } from '../../services/profile.service';
import { useNavigate } from 'react-router-dom';

// Define a type for valid booking statuses
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';

// Define booking interface
interface Booking {
  _id: string;
  service: {
    _id: string;
    name: string;
    category: string;
    price: number;
    pricingType: string;
    image?: string;
  };
  customer: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    phone?: string;
  };
  date: string;
  time: string;
  location: string;
  notes: string;
  status: BookingStatus;
  createdAt: string;
  statusHistory: Array<{
    status: string;
    date: string;
    notes: string;
  }>;
  contactPhone?: string;
}

interface BookingCardProps {
  booking: Booking;
  onStatusUpdate: (bookingId: string, status: BookingStatus, notes?: string) => Promise<void>;
  onViewDetails: (booking: Booking) => void;
  onMessageCustomer: (customerId: string) => void;
}

const BookingCard: React.FC<BookingCardProps> = ({ booking, onStatusUpdate, onViewDetails, onMessageCustomer }) => {
  // Status colors mapping
  const statusColors: Record<BookingStatus, string> = {
    pending: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    confirmed: 'bg-blue-50 text-blue-600 border-blue-200',
    completed: 'bg-green-50 text-green-600 border-green-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
    rejected: 'bg-gray-50 text-gray-600 border-gray-200'
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onStatusUpdate(booking._id, 'confirmed', 'Booking has been confirmed');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const { value: reason } = await Swal.fire({
      title: 'Rejection Reason',
      input: 'textarea',
      inputLabel: 'Please provide a reason for rejecting this booking',
      inputPlaceholder: 'Type your reason here...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a reason for rejection';
        }
        return null;
      }
    });

    if (reason) {
      try {
        setIsLoading(true);
        await onStatusUpdate(booking._id, 'rejected', reason);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      await onStatusUpdate(booking._id, 'completed', 'Service has been completed');
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  // Get profile image URL with fallback
  const getProfileImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }
    return profileService.getFullImageUrl(imagePath);
  };

  return (
    <div className={`bg-white p-5 rounded-xl border ${statusColors[booking.status].split(' ')[2] || 'border-gray-200'} hover:shadow-md transition-all`}>
      {/* Header with service name and status */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{booking.service.name}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status] || 'bg-gray-50 text-gray-600'}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </span>
      </div>

      {/* Customer info */}
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
          {booking.customer.profileImage ? (
            <img
              src={getProfileImageUrl(booking.customer.profileImage)}
              alt={`${booking.customer.firstName} ${booking.customer.lastName}`}
              className="h-10 w-10 object-cover"
              onError={(e) => {
                console.log("Profile image failed to load:", booking.customer.profileImage);
                const target = e.target as HTMLImageElement;
                target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
              }}
            />
          ) : (
            <FaUser className="text-gray-400" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-800">{`${booking.customer.firstName} ${booking.customer.lastName}`}</p>
          {booking.customer.phone && (
            <p className="text-sm text-gray-600">{booking.customer.phone}</p>
          )}
        </div>
      </div>

      {/* Booking details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600">
          <FaClock className="w-4 h-4 mr-2 text-gray-400" />
          <span>{formatDate(booking.date)} - {booking.time}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
          <span>{booking.location}</span>
        </div>
        {booking.service.price && (
          <div className="text-gray-600">
            <span className="font-medium">Price: </span>
            <span>${booking.service.price}{booking.service.pricingType === 'Hourly' ? '/hr' : ''}</span>
          </div>
        )}
        {booking.notes && (
          <div className="bg-gray-50 p-3 rounded-md mt-2">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Notes: </span>
              {booking.notes}
            </p>
          </div>
        )}
        {booking.contactPhone && (
          <div className="flex items-center text-gray-600">
            <FaPhone className="w-4 h-4 mr-2 text-gray-400" />
            <span>{booking.contactPhone}</span>
          </div>
        )}
      </div>

      {/* Action buttons based on status */}
      <div className="flex flex-wrap gap-2 mt-4">
        {booking.status === 'pending' && (
          <>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaCalendarCheck className="mr-2" />}
              Confirm
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
            >
              {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaCalendarTimes className="mr-2" />}
              Reject
            </button>
          </>
        )}
        {booking.status === 'confirmed' && (
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            {isLoading ? <FaSpinner className="animate-spin mr-2" /> : <FaClipboardCheck className="mr-2" />}
            Mark as Completed
          </button>
        )}
        <div className="flex flex-1 gap-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <FaInfoCircle className="mr-2" />
            Details
          </button>
          <button
            onClick={() => onMessageCustomer(booking.customer._id)}
            className="flex-1 px-3 py-2 border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors flex items-center justify-center"
          >
            <FaCommentAlt className="mr-2" />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

// Booking details modal component
interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen || !booking) return null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format history date
  const formatHistoryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Booking Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Service details */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Service</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-gray-900">{booking.service.name}</p>
              <p className="text-sm text-gray-600">Category: {booking.service.category}</p>
              <p className="text-sm text-gray-600">
                Price: ${booking.service.price}{booking.service.pricingType === 'Hourly' ? '/hr' : ''}
              </p>
            </div>
          </div>

          {/* Customer details */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Customer</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium text-gray-900">{`${booking.customer.firstName} ${booking.customer.lastName}`}</p>
              {booking.customer.phone && (
                <p className="text-sm text-gray-600">Phone: {booking.customer.phone}</p>
              )}
            </div>
          </div>

          {/* Appointment details */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Appointment</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Date: {formatDate(booking.date)}</p>
              <p className="text-sm text-gray-600">Time: {booking.time}</p>
              <p className="text-sm text-gray-600">Location: {booking.location}</p>
              {booking.notes && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Notes:</p>
                  <p className="text-sm text-gray-800 mt-1">{booking.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Status history */}
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Status History</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              {booking.statusHistory && booking.statusHistory.length > 0 ? (
                <div className="space-y-3">
                  {booking.statusHistory.map((history, index) => (
                    <div key={index} className="pb-3 border-b border-gray-200 last:border-0">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">{formatHistoryDate(history.date)}</span>
                      </div>
                      {history.notes && (
                        <p className="text-sm text-gray-600 mt-1">{history.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No status history available</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingRequestsPage: React.FC = () => {
  useDocumentTitle('Booking Requests');
  const navigate = useNavigate();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // Fetch bookings when component mounts
  useEffect(() => {
    fetchBookings();
  }, []);
  
  // Update filtered bookings when bookings or filter changes
  useEffect(() => {
    filterBookings();
  }, [bookings, filter]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/bookings/provider`, {
        headers: getAuthHeader()
      });
      
      if (response.data) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load your bookings. Please try again later.');
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };
  
  const filterBookings = () => {
    if (filter === 'all') {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter(booking => booking.status === filter));
    }
  };
  
  const handleStatusUpdate = async (bookingId: string, status: BookingStatus, notes?: string) => {
    try {
      // Show loading state
      setLoading(true);
      
      // First, update the booking status
      await axios.patch(
        `${API_URL}/api/bookings/${bookingId}/status`,
        { status, notes },
        { headers: getAuthHeader() }
      );
      
      // Then fetch the complete updated booking list to ensure we have all populated fields
      toast.success(`Booking ${status} successfully`);
      
      // Refresh all bookings data
      await fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
      setLoading(false);
      throw error;
    }
  };
  
  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBooking(null);
  };

  // Get counts for filters
  const getPendingCount = () => bookings.filter(booking => booking.status === 'pending').length;
  const getConfirmedCount = () => bookings.filter(booking => booking.status === 'confirmed').length;
  const getCompletedCount = () => bookings.filter(booking => booking.status === 'completed').length;
  const getCancelledCount = () => bookings.filter(booking => 
    booking.status === 'cancelled' || booking.status === 'rejected'
  ).length;

  // Add function to handle messaging customer
  const handleMessageCustomer = (customerId: string) => {
    // Navigate to the correct service provider messaging route with customer ID
    navigate(`/provider/messages?customerId=${customerId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Booking Requests</h1>
        <p className="text-gray-600">Manage your service bookings and appointments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            filter === 'all'
              ? 'bg-white border-x border-t border-gray-200 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilter('all')}
        >
          All ({bookings.length})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            filter === 'pending'
              ? 'bg-white border-x border-t border-gray-200 text-yellow-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilter('pending')}
        >
          Pending ({getPendingCount()})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            filter === 'confirmed'
              ? 'bg-white border-x border-t border-gray-200 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilter('confirmed')}
        >
          Confirmed ({getConfirmedCount()})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            filter === 'completed'
              ? 'bg-white border-x border-t border-gray-200 text-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilter('completed')}
        >
          Completed ({getCompletedCount()})
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm rounded-t-lg ${
            filter === 'cancelled' || filter === 'rejected'
              ? 'bg-white border-x border-t border-gray-200 text-red-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setFilter('cancelled')}
        >
          Cancelled/Rejected ({getCancelledCount()})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin h-8 w-8 text-green-500" />
        </div>
      ) : error ? (
        <div className="text-center p-6 bg-red-50 rounded-lg text-red-600">
          {error}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No bookings found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              onStatusUpdate={handleStatusUpdate}
              onViewDetails={handleViewDetails}
              onMessageCustomer={handleMessageCustomer}
            />
          ))}
        </div>
      )}

      {/* Booking details modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default BookingRequestsPage;
