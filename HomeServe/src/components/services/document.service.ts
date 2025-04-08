import axios from 'axios';
import { getAuthHeader } from '../utils/auth';

const API_URL = 'http://localhost:8080/api/documents';

export const documentService = {
  // Upload verification document
  async uploadDocument(docType: string, formData: FormData) {
    // Validate docType is one of the allowed types
    const validDocTypes = ['businessRegistration', 'representativeId', 'professionalLicenses', 'portfolio'];
    if (!validDocTypes.includes(docType)) {
      throw new Error('Invalid document type');
    }
    
    // Create a new FormData with the correct field name
    const correctedFormData = new FormData();
    
    // Get the file from the original formData (assuming it contains a "document" field)
    const file = formData.get('document');
    
    if (file) {
      // Add it with the correct field name that server expects
      correctedFormData.append('documents', file);
      
      // Copy any other fields that might be in the formData
      for (const [key, value] of formData.entries()) {
        if (key !== 'document') {
          correctedFormData.append(key, value);
        }
      }
    }
    
    const response = await axios.post(`${API_URL}/upload/${docType}`, correctedFormData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Get document verification status
  async getDocumentStatus() {
    try {
      const response = await axios.get(`${API_URL}/status`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting document status:', error);
      throw error;
    }
  },
  
  // Resubmit documents after rejection
  async resubmitDocuments() {
    const response = await axios.post(`${API_URL}/resubmit`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Delete a specific document file
  async deleteDocument(docType: string, fileId: string) {
    const response = await axios.delete(`${API_URL}/${docType}/${fileId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  },
  
  // Add this new method to submit documents for verification
  async submitDocumentsForVerification() {
    try {
      const response = await axios.post(`${API_URL}/submit`, {}, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting documents for verification:', error);
      throw error;
    }
  }
}; 