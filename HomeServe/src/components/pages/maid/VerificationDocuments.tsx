import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaCheck, FaTimes, FaExclamationTriangle, FaSpinner, FaEye, FaTrash, FaCheckCircle } from 'react-icons/fa';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import toast from 'react-hot-toast';
import { documentService } from '../../services/document.service';
import { useNavigate } from 'react-router-dom';

interface DocumentFile {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}

interface DocumentStatus {
  files: DocumentFile[];
  verified: boolean;
  uploadDate?: string;
  notes?: string;
}

interface DocumentsStatus {
  businessRegistration?: DocumentStatus;
  representativeId?: DocumentStatus;
  professionalLicenses?: DocumentStatus;
  portfolio?: DocumentStatus;
}

interface DocumentType {
  id: string;
  label: string;
  description: string;
  maxFiles: number;
  maxSize: number; // in MB
  accepts: string;
  examples: string[];
}

const VerificationDocumentsPage: React.FC = () => {
  useDocumentTitle('Verification Documents');
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [documents, setDocuments] = useState<DocumentsStatus>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, DocumentFile[]>>({});
  const [showPreview, setShowPreview] = useState<{docType: string, fileId: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  
  // Document types configuration
  const documentTypes: DocumentType[] = [
    {
      id: 'businessRegistration',
      label: 'Business Registration Documents',
      description: 'Business Permit, SEC/DTI Registration, Tax Identification Certificate',
      maxFiles: 3,
      maxSize: 10,
      accepts: "application/pdf,image/jpeg,image/png",
      examples: ['Business Permit', 'SEC/DTI Registration', 'Tax Identification Certificate']
    },
    {
      id: 'representativeId',
      label: 'Representative\'s Valid ID',
      description: 'A clear government-issued ID of the business owner or authorized representative (front and back)',
      maxFiles: 2,
      maxSize: 5,
      accepts: "image/jpeg,image/png",
      examples: ['Front of ID', 'Back of ID']
    },
    {
      id: 'professionalLicenses',
      label: 'Professional Licenses',
      description: 'Required for regulated professions (electricians, plumbers, etc.)',
      maxFiles: 3,
      maxSize: 10,
      accepts: "application/pdf,image/jpeg,image/png",
      examples: ['License 1', 'License 2', 'License 3']
    },
    {
      id: 'portfolio',
      label: 'Portfolio or Work Experience',
      description: 'Images or documents showcasing past work, customer references, or projects',
      maxFiles: 5,
      maxSize: 10,
      accepts: "application/pdf,image/jpeg,image/png",
      examples: ['Past Work', 'Customer References', 'Project Documentation']
    }
  ];
  
  useEffect(() => {
    fetchDocumentStatus();
    fetchVerificationStatus();
    
    // Initialize selectedFiles state with empty arrays for each document type
    const initialSelectedFiles: Record<string, DocumentFile[]> = {};
    documentTypes.forEach(docType => {
      initialSelectedFiles[docType.id] = [];
    });
    setSelectedFiles(initialSelectedFiles);
    
    // Cleanup function to revoke object URLs when component unmounts
    return () => {
      Object.values(selectedFiles).forEach(files => {
        files.forEach(file => {
          if (file.preview) URL.revokeObjectURL(file.preview);
        });
      });
    };
  }, []);
  
  const fetchDocumentStatus = async () => {
    try {
      setLoading(true);
      const response = await documentService.getDocumentStatus();
      
      // Log the response to see what's coming from the server
      console.log('Document status response:', response);
      
      // Make sure we're setting the status from the response
      setStatus(response.status);
      setNotes(response.notes);
      setDocuments(response.documents);
    } catch (error) {
      console.error('Error fetching document status:', error);
      toast.error('Failed to load document status');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchVerificationStatus = async () => {
    try {
      const response = await documentService.getDocumentStatus();
      if (response.status && response.verificationHistory) {
        setVerificationStatus(response.status);
        setVerificationHistory(response.verificationHistory);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
      toast.error('Could not retrieve verification status');
    }
  };
  
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const docConfig = documentTypes.find(dt => dt.id === docType);
    if (!docConfig) return;
    
    // Check if adding these files would exceed the limit
    const currentCount = selectedFiles[docType]?.length || 0;
    const newFiles = Array.from(files);
    
    if (currentCount + newFiles.length > docConfig.maxFiles) {
      toast.error(`You can only upload up to ${docConfig.maxFiles} files for ${docConfig.label}`);
      return;
    }
    
    // Check file sizes and create previews
    const validFiles: DocumentFile[] = [];
    
    for (const file of newFiles) {
      // Check file size
      if (file.size > docConfig.maxSize * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds the ${docConfig.maxSize}MB limit`);
        continue;
      }
      
      // Create preview URL
      const preview = URL.createObjectURL(file);
      
      // Add to valid files
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        preview,
        uploaded: false
      });
    }
    
    // Update state with new files
    setSelectedFiles(prev => ({
        ...prev,
      [docType]: [...(prev[docType] || []), ...validFiles]
    }));
    
    // Reset input
    e.target.value = '';
  };
  
  const removeFile = (docType: string, fileId: string) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev[docType].filter(file => file.id !== fileId);
      
      // Revoke the object URL to avoid memory leaks
      const fileToRemove = prev[docType].find(file => file.id === fileId);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return {
        ...prev,
        [docType]: updatedFiles
      };
    });
  };
  
  const handleSubmitAllDocuments = async () => {
    // Check if there are any files to upload
    const hasFilesToUpload = Object.values(selectedFiles).some(files => files.length > 0);
    
    if (!hasFilesToUpload) {
      toast.error('Please upload at least one document before submitting');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // For each document type with files, upload all files
      for (const docType of documentTypes) {
        const files = selectedFiles[docType.id] || [];
        
        if (files.length === 0) continue;
        
        setUploading(prev => ({ ...prev, [docType.id]: true }));
        
        // Upload each file
        for (const fileObj of files) {
          if (fileObj.uploaded) continue; // Skip already uploaded files
          
          const formData = new FormData();
          formData.append('document', fileObj.file);
          formData.append('documentType', docType.id);
          formData.append('fileIndex', files.indexOf(fileObj).toString());
          
          await documentService.uploadDocument(docType.id, formData);
          
          // Mark file as uploaded
          setSelectedFiles(prev => {
            const updatedFiles = prev[docType.id].map(f => 
              f.id === fileObj.id ? { ...f, uploaded: true } : f
            );
            
            return {
              ...prev,
              [docType.id]: updatedFiles
            };
          });
        }
        
        setUploading(prev => ({ ...prev, [docType.id]: false }));
      }
      
      // Submit documents for verification (if not rejected)
      if (status !== 'rejected') {
        await documentService.submitDocumentsForVerification();
        setStatus('pending');
      } else {
        // Resubmit if needed
        await documentService.resubmitDocuments();
        setStatus('pending');
      }
      
      // Refresh document status
      await fetchDocumentStatus();
      
      toast.success('All documents submitted successfully');
      
      // Clear selected files
      const emptySelectedFiles: Record<string, DocumentFile[]> = {};
      documentTypes.forEach(docType => {
        emptySelectedFiles[docType.id] = [];
      });
      setSelectedFiles(emptySelectedFiles);
      
    } catch (error) {
      console.error('Document submission error:', error);
      toast.error('Failed to submit documents');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadge = () => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Pending Verification
          </span>
        );
      case 'verified':
        return (
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Rejected
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
            Not Submitted
          </span>
        );
    }
  };
  
  const renderFilePreview = (file: DocumentFile, docType: string) => {
    const isImage = file.file.type.startsWith('image/');

    return (
      <div key={file.id} className="relative group rounded-lg overflow-hidden border border-gray-200 mb-2">
        <div className="flex items-center p-2 bg-gray-50">
          <div className="flex-1 truncate">
            <span className="text-sm font-medium">{file.file.name}</span>
            <span className="text-xs text-gray-500 ml-2">
              {(file.file.size / (1024 * 1024)).toFixed(2)} MB
            </span>
          </div>
          
          <div className="flex space-x-2">
            {isImage && (
              <button 
                className="text-blue-500 hover:text-blue-700"
                onClick={() => setShowPreview({ docType, fileId: file.id })}
              >
                <FaEye />
              </button>
            )}
            
            <button 
              className="text-red-500 hover:text-red-700"
              onClick={() => removeFile(docType, file.id)}
            >
              <FaTrash />
            </button>
          </div>
        </div>
        
        {file.uploaded && (
          <div className="absolute inset-0 bg-green-100 bg-opacity-50 flex items-center justify-center">
            <span className="text-green-600 flex items-center">
              <FaCheck className="mr-1" /> Uploaded
            </span>
          </div>
        )}
      </div>
    );
  };
  
  const anyFilesSelected = Object.values(selectedFiles).some(files => files.length > 0);
  
  // Add a new function to handle document deletion
  const handleDeleteDocument = async (docType: string, fileId: string) => {
    try {
      // Call the delete endpoint
      await documentService.deleteDocument(docType, fileId);
      
      // Show success message
      toast.success('Document deleted successfully');
      
      // Refresh document status to update the UI
      await fetchDocumentStatus();
      
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Service Provider Verification</h1>
        <p className="text-gray-600 mt-2">
          To complete your verification, please upload the required documents. Make sure all files are clear and meet the format guidelines.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Verification Status</h2>
          {getStatusBadge()}
        </div>
        
        {status === 'rejected' && notes && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="flex items-center text-red-800 font-medium">
              <FaExclamationTriangle className="mr-2" /> Reason for Rejection
            </h3>
            <p className="mt-1 text-red-700">{notes}</p>
            <p className="mt-2 text-red-600">Please update your documents and resubmit.</p>
          </div>
        )}
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <FaSpinner className="animate-spin text-gray-500 text-4xl" />
        </div>
      ) : (
        <div className="space-y-6">
          {documentTypes.map(docType => {
            const docStatus = documents[docType.id as keyof DocumentsStatus];
            const selectedDocFiles = selectedFiles[docType.id] || [];
            const hasExistingFiles = Boolean(docStatus?.files && docStatus.files.length > 0);
            const isUploading = uploading[docType.id] || false;
            
            return (
              <div key={docType.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-medium flex items-center">
                      {docType.id === 'businessRegistration' && '📜 '}
                      {docType.id === 'representativeId' && '🆔 '}
                      {docType.id === 'professionalLicenses' && '🎓 '}
                      {docType.id === 'portfolio' && '📂 '}
                      {docType.label}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">{docType.description}</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Up to {docType.maxFiles} files, {docType.id === 'representativeId' ? 'JPG/PNG' : 'PDF/JPG/PNG'}, max {docType.maxSize}MB each
                    </p>
                </div>
                
                  {docStatus?.verified && (
                    <span className="mt-2 sm:mt-0 bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs whitespace-nowrap">
                    Verified
                  </span>
                )}
              </div>
              
                {/* Existing files section */}
                {hasExistingFiles && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Previously Uploaded Documents:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(docStatus?.files || []).map((file, index) => (
                        <div key={index} className="text-sm border rounded p-2 bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FaCheck className="text-green-500 mr-2" />
                              <span className="font-medium">Document {index + 1}</span>
                              
                              {docStatus?.uploadDate && (
                                <span className="text-xs text-gray-500 ml-2">
                                  ({new Date(docStatus.uploadDate).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                            
                            {/* Add delete button */}
                            <button
                              onClick={() => handleDeleteDocument(docType.id, file.id || '')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Delete document"
                            >
                              <FaTrash size={14} />
                            </button>
                          </div>
                          
                          {file.url && (
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline text-xs mt-1 inline-block"
                            >
                              View Document
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Selected files preview */}
                {selectedDocFiles.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
                    <div className="space-y-2">
                      {selectedDocFiles.map(file => renderFilePreview(file, docType.id))}
                    </div>
                  </div>
                )}
                
                {/* File upload section */}
                {(!docStatus?.verified || status === 'rejected') && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 items-center">
                      <label
                        htmlFor={`document-${docType.id}`}
                        className={`px-4 py-2 ${selectedDocFiles.length > 0 ? 'bg-blue-500' : 'bg-green-500'} text-white rounded-md hover:bg-opacity-90 cursor-pointer inline-flex items-center text-sm transition`}
                      >
                        {isUploading ? (
                          <><FaSpinner className="animate-spin mr-2" /> Uploading...</>
                        ) : (
                          <><FaUpload className="mr-2" /> {selectedDocFiles.length > 0 ? 'Add More Files' : 'Upload Files'}</>
                        )}
                        <input
                          id={`document-${docType.id}`}
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileSelection(e, docType.id)}
                          accept={docType.accepts}
                          disabled={isUploading || selectedDocFiles.length >= docType.maxFiles}
                          multiple={docType.maxFiles > 1}
                        />
                      </label>
                      
                      <span className="text-xs text-gray-500">
                        {selectedDocFiles.length}/{docType.maxFiles} files selected
                      </span>
                    </div>
                    
                    {/* Examples */}
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Examples: {docType.examples.join(', ')}</p>
                    </div>
                    </div>
                  )}
                </div>
            );
          })}
        </div>
      )}
      
      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(null)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <h3 className="text-lg font-medium">Document Preview</h3>
            </div>
            <div className="p-4 flex justify-center">
              {showPreview && selectedFiles[showPreview.docType]?.find(f => f.id === showPreview.fileId) && (
                <img 
                  src={selectedFiles[showPreview.docType]?.find(f => f.id === showPreview.fileId)?.preview} 
                  alt="Document Preview" 
                  className="max-h-[60vh] object-contain"
                />
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button 
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                onClick={() => setShowPreview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={() => navigate('/provider/dashboard')}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-4"
        >
          Back to Dashboard
        </button>
        
        {(anyFilesSelected || status === 'rejected') && (
          <button
            onClick={handleSubmitAllDocuments}
            disabled={isSubmitting}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <><FaSpinner className="animate-spin mr-2" /> Submitting...</>
            ) : (
              <>Submit All Documents</>
            )}
          </button>
        )}
      </div>
      
      <div className="mt-4 bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700 flex items-center">
          <FaExclamationTriangle className="mr-2" /> 
          <span className="font-medium">Tip:</span> &nbsp; Ensure all documents are clear, complete, and valid to speed up the verification process.
        </p>
      </div>
      
      {verificationHistory.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Verification History</h3>
          
          {verificationStatus === 'verified' && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="flex items-center text-green-700">
                <FaCheckCircle className="mr-2" />
                Your account has been verified! You can now offer services.
              </p>
            </div>
          )}
          
          {verificationStatus === 'rejected' && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="flex items-center text-red-700">
                <FaExclamationTriangle className="mr-2" />
                Your verification was rejected. Please review the admin's notes below and resubmit your documents.
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {verificationHistory.map((item, index) => (
              <div key={index} className="border-b pb-3">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${
                    item.status === 'verified' ? 'text-green-600' : 
                    item.status === 'rejected' ? 'text-red-600' : 'text-blue-600'
                  }`}>
                    Status: {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(item.date).toLocaleString()}
                  </span>
                </div>
                {item.notes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Admin Notes:</p>
                    <p className="text-sm bg-gray-50 p-2 rounded">{item.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationDocumentsPage; 