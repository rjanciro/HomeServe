import axios from 'axios';
import { User, UserType } from '../../types';

const API_URL = 'http://localhost:8080/api';

export const authService = {
  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userType: UserType;
  }) {
    // Only allow homeowner or provider registrations
    if (userData.userType !== 'homeowner' && userData.userType !== 'provider') {
      throw new Error('Invalid user type');
    }
    
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async login(email: string, password: string, userType: UserType) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
      userType
    });
    
    // Store the token
    localStorage.setItem('token', response.data.token);
    
    // Get complete user profile with all fields after successful login
    const userProfile = await this.fetchUserProfile();
    
    return userProfile;
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!token && !!user;
  },

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  async adminLogin(username: string, password: string) {
    const response = await axios.post(`${API_URL}/auth/admin/login`, { 
      username, 
      password
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        userType: 'admin'
      }));
    }
    return response.data;
  },

  async fetchUserProfile() {
    try {
      // Make a request to get the full user profile
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Store the complete user data
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  async changePassword(oldPassword: string, newPassword: string) {
    try {
      const response = await axios.post(
        `${API_URL}/auth/change-password`,
        { oldPassword, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  async verifyPin(email: string, pin: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-pin`, { email, pin });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      throw error;
    }
  },

  async resendVerificationEmail(email: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, { email });
      return response.data;
    } catch (error) {
      console.error('Error resending verification email:', error);
      throw error;
    }
  },

  async verifyEmail(token: string) {
    try {
      const response = await axios.get(`${API_URL}/auth/verify-email/${token}`);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Error verifying email:', error);
      throw error;
    }
  },

  async requestPasswordChangePin(email: string) {
    try {
      const response = await axios.post(`${API_URL}/auth/request-password-change-pin`, 
        { email },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error requesting password change PIN:', error);
      throw error;
    }
  },

  async verifyPasswordChangePin(email: string, pin: string, newPassword: string) {
    try {
      const response = await axios.post(
        `${API_URL}/auth/verify-password-change-pin`,
        { email, pin, newPassword },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying password change PIN:', error);
      throw error;
    }
  }
}; 