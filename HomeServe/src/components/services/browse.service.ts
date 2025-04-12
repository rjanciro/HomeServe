import axios from 'axios';
import { getAuthHeader } from '../utils/auth'; // Use regular user auth
import { Housekeeper } from '../pages/home-owner/OneTimeBooking'; // Import the interface

const API_URL = 'http://localhost:8080/api/browse';

export const browseService = {
  async getAvailableHousekeeperServices(): Promise<Housekeeper[]> {
    try {
      const response = await axios.get(`${API_URL}/services`, {
        headers: getAuthHeader() 
      });
      // Map _id to id if your frontend uses 'id' primarily
      return response.data.map((hk: any) => ({
          ...hk,
          id: hk._id,
          services: hk.services.map((s: any) => ({ ...s, id: s._id }))
      }));
    } catch (error) {
      console.error('Error fetching available services:', error);
      // Handle specific errors if needed
      throw error; // Re-throw to be caught by the component
    }
  }
}; 