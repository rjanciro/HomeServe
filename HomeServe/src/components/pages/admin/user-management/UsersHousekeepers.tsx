import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaUserCheck, FaSpinner, FaFilter, FaSearch, FaEye, FaFileAlt, FaFolder, FaLock, FaLockOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import useDocumentTitle from '../../../../hooks/useDocumentTitle';
import { adminService } from '../../../services/admin.service';
import { profileService } from '../../../services/profile.service';

// Define provider type
interface ServiceProvider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profileImage?: string;
  businessName?: string;
  bio?: string;
  isVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verificationDate?: string;
  verificationNotes?: string;
  createdAt: string;
  verificationDocuments?: {
    businessRegistration?: {
      files: Array<{
        url?: string;
        path?: string;
        filename: string;
        uploadDate: string;
        verified: boolean;
      }>;
    };
    representativeId?: {
      files: Array<{
        url?: string;
        path?: string;
        filename: string;
        uploadDate: string;
        verified: boolean;
      }>;
    };
    professionalLicenses?: {
      files: Array<{
        url?: string;
        path?: string;
        filename: string;
        uploadDate: string;
        verified: boolean;
      }>;
    };
    portfolio?: {
      files: Array<{
        url?: string;
        path?: string;
        filename: string;
        uploadDate: string;
        verified: boolean;
      }>;
    };
  };
  isActive?: boolean;
  statusUpdateDate?: string;
  statusNotes?: string;
}

const UsersServiceProvidersPage: React.FC = () => {
  useDocumentTitle('Service Providers | Admin');
  
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState<string | null>(null);
  const [providerDocuments, setProviderDocuments] = useState<any>(null);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  
  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
  }, []);

  // Filter providers when filter or search changes
  useEffect(() => {
    filterProviders();
  }, [providers, statusFilter, searchQuery]);
  
  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllProviders();
      setProviders(response);
      setFilteredProviders(response);
    } catch (error) {
      console.error('Failed to fetch service providers:', error);
      toast.error('Failed to load service providers');
    } finally {
      setLoading(false);
    }
  };
  
  const filterProviders = () => {
    let filtered = [...providers];
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(provider => provider.verificationStatus === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(provider => 
        provider.firstName.toLowerCase().includes(query) ||
        provider.lastName.toLowerCase().includes(query) ||
        provider.email.toLowerCase().includes(query) ||
        (provider.businessName && provider.businessName.toLowerCase().includes(query))
      );
    }
    
    setFilteredProviders(filtered);
  };

  const handleVerify = async (provider: ServiceProvider, approved: boolean) => {
    try {
      const { value: notes } = await Swal.fire({
        title: `${approved ? 'Approve' : 'Reject'} Provider`,
        input: 'textarea',
        inputLabel: 'Notes (optional)',
        inputPlaceholder: approved 
          ? 'Any notes about this provider...'
          : 'Please provide a reason for rejection...',
        showCancelButton: true,
        confirmButtonText: approved ? 'Approve' : 'Reject',
        confirmButtonColor: approved ? '#10B981' : '#EF4444',
      });
      
      if (notes !== undefined) { // User clicked confirm
        await adminService.verifyProvider(provider._id, {
          approved: approved,
          notes: notes
        });
        toast.success(`Provider ${approved ? 'approved' : 'rejected'} successfully`);
        
        // Update provider in local state
        setProviders(prevProviders => 
          prevProviders.map(p => 
            p._id === provider._id 
              ? {
                  ...p, 
                  isVerified: approved,
                  verificationStatus: approved ? 'verified' : 'rejected',
                  verificationDate: new Date().toISOString(),
                  verificationNotes: notes
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to process verification');
    }
  };
  
  const handleViewDetails = async (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsDetailsModalOpen(true);
    
    // Fetch provider documents if they have any
    if (hasVerificationDocuments(provider)) {
      setDocumentsLoading(true);
      try {
        const documentsData = await adminService.getProviderDocuments(provider._id);
        setProviderDocuments(documentsData.documents);
      } catch (error) {
        console.error('Error fetching provider documents:', error);
        toast.error('Failed to load provider documents');
      } finally {
        setDocumentsLoading(false);
      }
    }
  };
  
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const hasVerificationDocuments = (provider: ServiceProvider) => {
    const docs = provider.verificationDocuments;
    if (!docs) return false;
    
    const hasBusinessDocs = docs.businessRegistration?.files && docs.businessRegistration.files.length > 0;
    const hasIdDocs = docs.representativeId?.files && docs.representativeId.files.length > 0;
    const hasLicenseDocs = docs.professionalLicenses?.files && docs.professionalLicenses.files.length > 0;
    const hasPortfolioDocs = docs.portfolio?.files && docs.portfolio.files.length > 0;
    
    return hasBusinessDocs || hasIdDocs || hasLicenseDocs || hasPortfolioDocs;
  };

  const getDocumentCount = (provider: ServiceProvider) => {
    const docs = provider.verificationDocuments;
    if (!docs) return 0;
    
    let count = 0;
    count += docs.businessRegistration?.files?.length || 0;
    count += docs.representativeId?.files?.length || 0;
    count += docs.professionalLicenses?.files?.length || 0;
    count += docs.portfolio?.files?.length || 0;
    
    return count;
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Verified</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const getProfileImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }
    
    return profileService.getFullImageUrl(imagePath) || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  };

  // Update the openDocumentPreview function to handle server paths properly
  const openDocumentPreview = (url: string | undefined, docType: string) => {
    // Add null check for URL
    if (!url) {
      console.error("Document URL is undefined for document type:", docType);
      toast.error(`Cannot preview document: URL is missing for ${docType}`);
      return;
    }
    
    console.log("Opening document preview with URL:", url);
    
    // Format the URL properly - the backend returns a path like '/uploads/verification/file.png'
    // We need to prepend the API server URL if it's not already a full URL
    const apiBaseUrl = 'http://localhost:8080'; // This should match your API_URL in services
    const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url}`;
    
    // Log the constructed URL for debugging
    console.log("Full document URL:", fullUrl);
    
    setSelectedDocumentUrl(fullUrl);
    setIsDetailsModalOpen(true);
  };

  // Add a new function to close document preview
  const closeDocumentPreview = () => {
    setSelectedDocumentUrl(null);
  };

  const mapStatusToDisplayStatus = (status: string) => {
    if (status === 'approved') return 'verified';
    if (status === 'verified') return 'verified';
    return status;
  };

  // Add a new function to handle disabling/enabling service providers
  const handleToggleProviderStatus = async (provider: any) => {
    const currentStatus = provider.isActive !== false; // If undefined, treat as active
    const newStatus = !currentStatus;
    
    try {
      const { value: notes } = await Swal.fire({
        title: `${newStatus ? 'Enable' : 'Disable'} Provider`,
        input: 'textarea',
        inputLabel: 'Notes (optional)',
        inputPlaceholder: newStatus 
          ? 'Any notes about enabling this provider...'
          : 'Please provide a reason for disabling this provider...',
        showCancelButton: true,
        confirmButtonText: newStatus ? 'Enable' : 'Disable',
        confirmButtonColor: newStatus ? '#10B981' : '#EF4444',
      });
      
      if (notes !== undefined) { // User clicked confirm
        await adminService.updateProviderStatus(provider._id, {
          isActive: newStatus,
          notes: notes
        });
        
        toast.success(`Provider ${newStatus ? 'enabled' : 'disabled'} successfully`);
        
        // Update provider in local state
        setProviders(prevProviders => 
          prevProviders.map(p => 
            p._id === provider._id 
              ? {
                  ...p, 
                  isActive: newStatus,
                  statusUpdateDate: new Date().toISOString(),
                  statusNotes: notes
                }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Status update error:', error);
      toast.error('Failed to update provider status');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Providers</h1>
        
        <div className="flex items-center space-x-4">
          {/* Status filter */}
          <div className="relative">
            <select
              className="bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Providers</option>
              <option value="pending">Pending Verification</option>
              <option value="approved">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
            <FaFilter className="absolute right-3 top-3 text-gray-400" />
          </div>
          
          {/* Search box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search providers..."
              className="bg-white border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-blue-500 text-4xl" />
        </div>
      ) : filteredProviders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <FaUserCheck className="text-6xl text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">No Providers Found</h2>
          <p className="text-gray-600">
            {statusFilter !== 'all' 
              ? `No service providers with status: ${statusFilter}` 
              : "No service providers match your search criteria"}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Documents
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProviders.map((provider) => (
                <tr key={provider._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
                          src={getProfileImageUrl(provider.profileImage)}
                          alt={`${provider.firstName} ${provider.lastName}`}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {provider.firstName} {provider.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {provider.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{provider.businessName || 'Not provided'}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {provider.bio ? (provider.bio.length > 60 ? `${provider.bio.substring(0, 60)}...` : provider.bio) : 'No description'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {hasVerificationDocuments(provider) ? (
                        <>
                          <FaFolder className="text-blue-500 mr-2" />
                          <span className="text-sm">{getDocumentCount(provider)} document(s)</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">No documents uploaded</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusBadgeClass(provider.verificationStatus)
                    }`}>
                      {mapStatusToDisplayStatus(provider.verificationStatus).charAt(0).toUpperCase() + 
                       mapStatusToDisplayStatus(provider.verificationStatus).slice(1)}
                    </span>
                    {provider.verificationDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(provider.verificationDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      provider.isActive === false ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {provider.isActive === false ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link 
                      to={`/admin/service-providers/${provider._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye className="inline mr-1" /> View Documents
                    </Link>
                    
                    {provider.verificationStatus === 'pending' && (
                      <>
                        {/* <button
                          onClick={() => handleVerify(provider, true)}
                          className="text-green-600 hover:text-green-900 mr-3"
                          title="Approve"
                        >
                          <FaCheck />
                        </button>
                        <button
                          onClick={() => handleVerify(provider, false)}
                          className="text-red-600 hover:text-red-900"
                          title="Reject"
                        >
                          <FaTimes />
                        </button> */}
                      </>
                    )}
                    
                    {provider.verificationStatus === 'rejected' && (
                      <button
                        onClick={() => handleVerify(provider, true)}
                        className="text-green-600 hover:text-green-900"
                        title="Approve"
                      >
                        <FaCheck /> Approve
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleToggleProviderStatus(provider)}
                      className={`ml-3 text-${provider.isActive === false ? 'green' : 'red'}-600 hover:text-${provider.isActive === false ? 'green' : 'red'}-900`}
                      title={provider.isActive === false ? "Enable Provider" : "Disable Provider"}
                    >
                      {provider.isActive === false ? <FaLockOpen /> : <FaLock />} 
                      {provider.isActive === false ? " Enable" : " Disable"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Provider Details Modal */}
      {isDetailsModalOpen && selectedProvider && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Provider Details</h2>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row mb-6">
                <div className="mr-6 mb-4 sm:mb-0">
                  <img
                    src={getProfileImageUrl(selectedProvider.profileImage)}
                    alt={`${selectedProvider.firstName} ${selectedProvider.lastName}`}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedProvider.firstName} {selectedProvider.lastName}</h3>
                  <p className="text-gray-600">{selectedProvider.email}</p>
                  <p className="text-gray-600">{selectedProvider.phone || 'No phone number'}</p>
                  
                  <div className="mt-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusBadgeClass(selectedProvider.verificationStatus)
                    }`}>
                      {mapStatusToDisplayStatus(selectedProvider.verificationStatus).charAt(0).toUpperCase() + 
                       mapStatusToDisplayStatus(selectedProvider.verificationStatus).slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Business Information</h4>
                <p className="text-gray-800 font-medium">{selectedProvider.businessName || 'No business name provided'}</p>
                <p className="text-gray-600 mt-1">{selectedProvider.bio || 'No business description provided'}</p>
              </div>
              
              {selectedProvider.verificationNotes && (
                <div className="mb-6">
                  <h4 className="font-medium mb-2">Verification Notes</h4>
                  <div className="bg-gray-50 p-3 rounded-md text-gray-700">
                    {selectedProvider.verificationNotes}
                  </div>
                </div>
              )}
              
              <div className="mb-6 mt-4">
                <Link
                  to={`/admin/service-providers/${selectedProvider._id}`}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 inline-flex items-center"
                >
                  <FaFolder className="mr-2" /> View Verification Documents
                </Link>
              </div>
              
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    if (selectedProvider.verificationStatus === 'pending') {
                      handleVerify(selectedProvider, false);
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedProvider.verificationStatus === 'pending' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400'
                  }`}
                  disabled={selectedProvider.verificationStatus !== 'pending'}
                >
                  <FaTimes className="inline mr-1" /> Reject
                </button>
                
                <button
                  onClick={() => {
                    setIsDetailsModalOpen(false);
                    if (selectedProvider.verificationStatus !== 'verified') {
                      handleVerify(selectedProvider, true);
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedProvider.verificationStatus !== 'verified' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400'
                  }`}
                  disabled={selectedProvider.verificationStatus === 'verified'}
                >
                  <FaCheck className="inline mr-1" /> Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Document Preview Modal */}
      {selectedDocumentUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Document Preview</h3>
              <button onClick={closeDocumentPreview} className="text-gray-500 hover:text-gray-700">
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="p-4 flex justify-center" style={{ maxHeight: "70vh", overflow: "auto" }}>
              {selectedDocumentUrl ? (
                <img 
                  src={selectedDocumentUrl} // Already the full URL
                  alt="Document preview" 
                  className="max-w-full max-h-[60vh] object-contain"
                  onError={(e) => {
                    console.error("Failed to load image:", selectedDocumentUrl);
                    toast.error("Failed to load document preview");
                  }}
                />
              ) : (
                <div className="text-center text-gray-500">
                  <p>No document to preview</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <a 
                href={selectedDocumentUrl} 
                download
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download
              </a>
              <button 
                onClick={closeDocumentPreview}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersServiceProvidersPage;
