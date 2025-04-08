import axios from 'axios';
import { getAdminAuthHeader } from '../utils/auth';

const API_URL = 'http://localhost:8080/api/admin';

interface VerificationParams {
  approved: boolean;
  notes: string;
  documentReview?: Record<string, any>;
}

export const adminService = {
  // Admin login
  async login(username: string, password: string) {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  // Log out admin
  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  },

  // Get current admin
  getCurrentAdmin() {
    const adminStr = localStorage.getItem('admin');
    return adminStr ? JSON.parse(adminStr) : null;
  },

  // Get all service providers
  async getAllProviders() {
    const response = await axios.get(`${API_URL}/verification/providers`, {
      headers: getAdminAuthHeader()
    });
    return response.data;
  },

  // Get provider documents
  async getProviderDocuments(userId: string) {
    try {
      const response = await axios.get(`${API_URL}/verification/provider-documents/${userId}`, {
        headers: getAdminAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting provider documents:', error);
      throw error;
    }
  },

  // Verify a document
  async verifyDocument(userId: string, docType: string, params: VerificationParams) {
    const response = await axios.post(`${API_URL}/verification/verify-document`, {
      userId,
      docType,
      approved: params.approved,
      notes: params.notes
    }, {
      headers: getAdminAuthHeader()
    });
    return response.data;
  },

  // Verify service provider
  async verifyProvider(userId: string, params: VerificationParams) {
    try {
      const response = await axios.post(
        `${API_URL}/verification/verify-provider`,
        {
          userId,
          approved: params.approved,
          notes: params.notes,
          documentReview: params.documentReview
        },
        {
          headers: getAdminAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying provider:', error);
      throw error;
    }
  },

  // Add this new method to the adminService object
  async getProviderById(userId: string) {
    try {
      const response = await axios.get(`${API_URL}/users/providers/${userId}`, {
        headers: getAdminAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting provider data:', error);
      throw error;
    }
  },

  // Add this method to the admin service
  updateProviderStatus: async (providerId: string, data: { isActive: boolean, notes: string }) => {
    try {
      const response = await axios.put(
        `${API_URL}/verification/provider-status/${providerId}`,
        data,
        {
          headers: getAdminAuthHeader()
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error updating provider status: ', error);
      throw error;
    }
  }
}; 