import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaSpinner, FaExclamationTriangle, FaFile, FaDownload, FaImage, FaEye, FaFolder, FaCheckCircle, FaRegClock } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import useDocumentTitle from '../../../../hooks/useDocumentTitle';
import { adminService } from '../../../services/admin.service';
import { Link } from 'react-router-dom';
import { profileService } from '../../../services/profile.service';

interface DocumentFile {
  id?: string;
  filename: string;
  url?: string;     // From frontend interface
  path?: string;    // From backend database model
  uploadDate: string;
  verified?: boolean;
  mimetype?: string;
  size?: number;
}

interface DocumentType {
  files: DocumentFile[];
  verified: boolean;
  uploadDate?: string;
  notes?: string;
}

interface ProviderDocuments {
  businessRegistration?: DocumentType;
  representativeId?: DocumentType;
  professionalLicenses?: DocumentType;
  portfolio?: DocumentType;
}

interface Provider {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  verificationStatus?: string;
  documents?: ProviderDocuments;
  profileImage?: string;
  businessName?: string;
  bio?: string;
  verificationDate?: string;
  verificationNotes?: string;
}

interface VerificationHistory {
  status: 'pending' | 'verified' | 'approved' | 'rejected';
  date: string;
  notes?: string;
  reviewer?: string;
}

// Define this in a shared types file
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

const ProviderVerificationDetailsPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  
  useDocumentTitle('Provider Verification Details | Admin');
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [documents, setDocuments] = useState<ProviderDocuments | null>(null);
  const [history, setHistory] = useState<VerificationHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [documentNotes, setDocumentNotes] = useState<Record<string, string>>({
    businessRegistration: '',
    representativeId: '',
    professionalLicenses: '',
    portfolio: ''
  });
  const [selectedDocument, setSelectedDocument] = useState<{url: string, type: string} | null>(null);

  useEffect(() => {
    if (userId) {
      fetchProviderDocuments();
    }
  }, [userId]);

  const fetchProviderDocuments = async () => {
    setLoading(true);
    try {
      // First, get the documents which has incomplete provider info
      const data = await adminService.getProviderDocuments(userId as string);
      
      // Detailed logging of the entire response structure
      console.log("===== COMPLETE API RESPONSE =====");
      console.log(JSON.stringify(data, null, 2));
      
      // Check specifically for representativeId documents
      console.log("===== REPRESENTATIVE ID DOCUMENTS =====");
      console.log(JSON.stringify(data.documents?.representativeId, null, 2));
      
      if (data.documents?.representativeId?.files) {
        console.log("First file properties:", Object.keys(data.documents.representativeId.files[0]));
      }
      
      // Set the documents and history
      setDocuments(data.documents);
      setHistory(data.history || []);

      // Pre-fill notes if they exist
      const notes: Record<string, string> = {};
      for (const docType in data.documents) {
        if (data.documents[docType]?.notes) {
          notes[docType] = data.documents[docType].notes || '';
        }
      }
      setDocumentNotes(notes);
      
      // Now get the provider data from the getAllProviders endpoint
      try {
        const providers = await adminService.getAllProviders();
        const fullProviderData = providers.find((p: any) => p._id === userId);
        
        if (fullProviderData) {
          console.log("Found provider with image:", fullProviderData.profileImage);
          setProvider(fullProviderData); // This should have the profileImage
        } else {
          // Still use the original provider data if not found in the list
          setProvider(data.provider);
        }
      } catch (err) {
        console.error('Error fetching complete provider data:', err);
        // Still use the original provider data if the second request fails
        setProvider(data.provider);
      }
    } catch (error) {
      console.error('Error fetching provider documents:', error);
      toast.error('Failed to load provider verification documents');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (approved: boolean) => {
    if (!provider) return;
    
    // Prompt for notes
    const { value: notes } = await Swal.fire({
      title: 'Review Notes',
      input: 'textarea',
      inputLabel: approved ? 'Approval notes (optional)' : 'Rejection reason (required)',
      inputPlaceholder: approved ? 'Enter any notes...' : 'Please explain why this provider is being rejected...',
      inputValidator: (value) => {
        if (!approved && !value) {
          return 'You need to provide a reason for rejection';
        }
        return null;
      },
      showCancelButton: true,
      confirmButtonText: approved ? 'Approve Provider' : 'Reject Provider',
      confirmButtonColor: approved ? '#10B981' : '#EF4444',
    });
    
    if (notes === undefined) return; // User cancelled
    
    setVerifying(true);
    try {
      await adminService.verifyProvider(provider._id, {
        approved: approved,
        notes: notes,
        documentReview: {}
      });
      
      toast.success(`Provider ${approved ? 'approved' : 'rejected'} successfully`);
      
      // Refresh data
      fetchProviderDocuments();
    } catch (error) {
      console.error('Error during provider review:', error);
      toast.error('Failed to process provider review');
    } finally {
      setVerifying(false);
    }
  };

  const updateDocumentNotes = (docType: string, notes: string) => {
    setDocumentNotes(prev => ({
      ...prev,
      [docType]: notes
    }));
  };

  const openDocumentPreview = (url: string | undefined, docType: string) => {
    if (!url) {
      console.error("Document URL is undefined for document type:", docType);
      toast.error(`Cannot preview document: URL is missing`);
      return;
    }
    
    console.log("Opening document preview with URL:", url);
    
    // Use environment variable or a configuration value for API URL
    // This approach is more maintainable across environments
    const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';
    
    // Format the URL properly - handle both relative and absolute URLs
    const fullUrl = url.startsWith('http') ? url : `${apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
    
    console.log("Full URL for preview:", fullUrl);
    
    setSelectedDocument({
      url: fullUrl,
      type: docType
    });
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></span>
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-200 shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5"></span>
            Pending
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200 shadow-sm flex items-center">
            <span className="w-2 h-2 rounded-full bg-gray-500 mr-1.5"></span>
            Unknown
          </span>
        );
    }
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case 'verified':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProfileImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) {
      return "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }
    
    return profileService.getFullImageUrl(imagePath) || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  };

  const renderDocumentSection = (docType: string, label: string) => {
    const docData = documents?.[docType as keyof ProviderDocuments];
    
    // Debug log to see document data structure
    console.log(`Document data for ${docType}:`, docData);
    
    if (!docData || !docData.files || docData.files.length === 0) {
      return null;
    }
    
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold border-l-4 border-blue-500 pl-3 py-1 text-gray-700">{label}</h3>
          {/* Add verification badge for this document type */}
          {docData.verified && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
              <FaCheckCircle className="mr-1" /> Verified
            </span>
          )}
        </div>
        
        {/* Show document notes if they exist */}
        {docData.notes && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-r-md">
            <p className="text-sm font-medium text-blue-800">Document Notes:</p>
            <p className="text-gray-700 mt-1">{docData.notes}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {docData.files.map((file, index) => {
            // Get file URL
            const fileUrl = file.url || file.path;
            
            // Log the raw URL to debug
            console.log(`Raw URL for ${file.filename}:`, fileUrl);
            
            // Format full URL
            const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8080';
            
            // Remove any duplicate slashes that might be causing issues
            let cleanPath = fileUrl || '';
            if (cleanPath.startsWith('/')) {
              cleanPath = cleanPath.substring(1);
            }
            
            const fullUrl = fileUrl?.startsWith('http') 
              ? fileUrl 
              : `${apiBaseUrl}/${cleanPath}`;
            
            console.log(`Final URL being used:`, fullUrl);
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-200">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-gray-800 truncate">{file.filename}</h4>
                    <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-1">
                      {new Date(file.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {/* Display the document info */}
                <div className="p-4 bg-gray-50 flex items-center">
                  <div className="p-2 bg-blue-100 rounded-full mr-3">
                    <FaFile className="text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm text-gray-700">{file.filename}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {file.size ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                    </div>
                  </div>
                </div>
                
                {/* Try to display the image preview */}
                {isImageFile(file.filename) && fullUrl && (
                  <div className="px-4 py-3 bg-black bg-opacity-5">
                    <div className="relative w-full h-48 overflow-hidden rounded-md bg-gray-200">
                      <img 
                        src={fullUrl}
                        alt={file.filename} 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          console.error("Failed to load image:", fullUrl);
                          const target = e.target as HTMLImageElement;
                          target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                          target.className = "w-full h-full object-contain opacity-50";
                        }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex p-3 bg-white border-t border-gray-100">
                  <a 
                    href={fullUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-md text-sm flex items-center justify-center hover:bg-blue-100 transition-colors mr-2"
                  >
                    <FaEye className="mr-1" /> View
                  </a>
                  <a 
                    href={fullUrl}
                    download={file.filename}
                    className="flex-1 py-2 bg-green-50 text-green-600 rounded-md text-sm flex items-center justify-center hover:bg-green-100 transition-colors"
                  >
                    <FaDownload className="mr-1" /> Download
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const isImageFile = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension || '');
  };

  const handleApproveProvider = async () => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: 'Approve Provider',
        text: 'Are you sure you want to approve this service provider?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4CAF50',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        // Show loading toast
        const loadingToast = toast.loading('Approving provider...');
        
        // Collect all document reviews (assuming all are approved)
        const documentReview: Record<string, {verified: boolean}> = {};
        if (provider?.documents) {
          Object.keys(provider.documents).forEach(docType => {
            documentReview[docType] = { verified: true };
          });
        }
        
        // Call the API to verify the provider
        if (userId) {
          await adminService.verifyProvider(userId, {
            approved: true,
            notes: 'Provider approved by admin',
            documentReview
          });
        }
        
        // Dismiss loading toast and show success message
        toast.dismiss(loadingToast);
        toast.success('Provider successfully approved');
        
        // Refresh the provider data
        fetchProviderDocuments();
      }
    } catch (error) {
      console.error('Error approving provider:', error);
      toast.error('Failed to approve provider');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/admin/service-providers" className="text-blue-600 hover:text-blue-800 flex items-center transition-colors duration-200 font-medium">
          <FaArrowLeft className="mr-2" /> Back to Providers
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Provider Verification Details</h1>
          {provider && (
            <p className="text-gray-600 mt-1">
              Review and verify documents for {provider.firstName} {provider.lastName}
            </p>
          )}
        </div>
        
        {loading ? (
          <div className="p-8 flex justify-center items-center">
            <div className="flex flex-col items-center">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mb-2" />
              <p className="text-gray-500">Loading provider details...</p>
            </div>
          </div>
        ) : !provider ? (
          <div className="p-8 text-center">
            <div className="bg-yellow-50 rounded-lg p-6 inline-block">
              <FaExclamationTriangle className="text-yellow-500 text-5xl mx-auto mb-3" />
              <p className="text-gray-700 font-medium">Provider details not found</p>
              <p className="text-gray-500 text-sm mt-1">The requested provider information is unavailable</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-100">
              <div className="flex flex-col md:flex-row">
                <div className="mb-6 md:mb-0 md:mr-8">
                  <div className="relative">
                    <img
                      src={getProfileImageUrl(provider.profileImage)}
                      alt={`${provider.firstName} ${provider.lastName}`}
                      className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-md"
                      onError={(e) => {
                        console.log("Image failed to load, using default:", provider.profileImage);
                        const target = e.target as HTMLImageElement;
                        target.src = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                      }}
                    />
                    <div className="absolute bottom-1 right-1">
                      {renderStatusBadge(provider.verificationStatus || 'pending')}
                    </div>
                  </div>
                </div>
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 text-gray-800">
                    {provider.firstName} {provider.lastName}
                  </h2>
                  <p className="text-gray-600 mb-2 flex items-center">
                    <span className="inline-block bg-gray-100 rounded-full p-1 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </span>
                    {provider.email}
                  </p>
                  {provider.phone && (
                    <p className="text-gray-600 mb-3 flex items-center">
                      <span className="inline-block bg-gray-100 rounded-full p-1 mr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </span>
                      {provider.phone}
                    </p>
                  )}
                  
                  {provider.verificationDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last updated: {new Date(provider.verificationDate).toLocaleDateString('en-US', {
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814L10 13.197l-4.419 2.617A1 1 0 014 15V4zm2-1a1 1 0 00-1 1v10.566l3.419-2.022a1 1 0 011.162 0L13 14.566V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
                </svg>
                Business Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Business Name</p>
                  <p className="font-medium text-lg">{provider.businessName || 'No business name provided'}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">Bio</p>
                  <p className="text-gray-700">{provider.bio || 'No bio information provided'}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Verification Documents
              </h2>
              
              <div className="space-y-8">
                {renderDocumentSection('businessRegistration', 'Business Registration')}
                {renderDocumentSection('representativeId', 'Representative ID')}
                {renderDocumentSection('professionalLicenses', 'Professional Licenses')}
                {renderDocumentSection('portfolio', 'Portfolio or Work Experience')}
              </div>
              
              <div className="mt-10 flex justify-end space-x-4">
                {provider.verificationStatus === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleReviewAction(false)}
                      disabled={verifying}
                      className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center shadow-sm"
                    >
                      {verifying ? <FaSpinner className="animate-spin mr-2" /> : <FaTimes className="mr-2" />}
                      Reject Provider
                    </button>
                    <button 
                      onClick={handleApproveProvider}
                      disabled={verifying}
                      className="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center shadow-sm"
                    >
                      {verifying ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
                      Approve Provider
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-12 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Verification History
              </h2>
              
              {history.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {history.map((item, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              item.status === 'verified' || item.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              item.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                            {item.notes || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.reviewer || 'System'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                  <FaRegClock className="mx-auto text-gray-400 text-4xl mb-2" />
                  <p className="text-gray-500">No verification history available</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Document Preview Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-90vh overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium">Document Preview - {selectedDocument.type}</h3>
              <button onClick={() => setSelectedDocument(null)} className="text-gray-500 hover:text-gray-700">
                <span className="text-xl">×</span>
              </button>
            </div>
            
            <div className="p-4 flex justify-center" style={{ maxHeight: "70vh", overflow: "auto" }}>
              {selectedDocument.url ? (
                isImageFile(selectedDocument.url) ? (
                  <img 
                    src={selectedDocument.url}
                    alt="Document preview" 
                    className="max-w-full max-h-[60vh] object-contain"
                    onError={(e) => {
                      console.error("Failed to load image:", selectedDocument.url);
                      toast.error("Failed to load document preview");
                    }}
                  />
                ) : (
                  <iframe
                    src={selectedDocument.url}
                    className="w-full"
                    style={{ height: "60vh" }}
                    title="Document preview"
                    onError={() => toast.error("Failed to load document preview")}
                  />
                )
              ) : (
                <div className="text-center text-gray-500">
                  <p>No document to preview</p>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <a 
                href={selectedDocument.url}
                download
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Download
              </a>
              <button 
                onClick={() => setSelectedDocument(null)}
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

export default ProviderVerificationDetailsPage;