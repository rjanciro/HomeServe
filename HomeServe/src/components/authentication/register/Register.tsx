import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserType, FormData } from '../../../types';
import Logo from '../../../assets/icons/HomeServe_Transparent_Logo.png';
import useDocumentTitle from '../../../hooks/useDocumentTitle.ts';
import { authService } from '../../services/auth.service';
import axios from 'axios';

const RegisterPage: React.FC = () => {
  useDocumentTitle('Register');

  const navigate = useNavigate();
  const location = useLocation();
  const [userType, setUserType] = useState<UserType>('homeowner');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if there's a type=maid in the URL query params
    const searchParams = new URLSearchParams(location.search);
    const type = searchParams.get('type');
    if (type === 'maid') {
      setUserType('maid');
    }
  }, [location]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType
      };

      // First, check if the passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setIsLoading(false);
        return;
      }

      const response = await authService.register(userData);
      console.log('Registration successful:', response);
      
      // Redirect to verification pending page
      navigate('/verification-pending', { state: { email: formData.email } });
    } catch (err) {
      console.error('Registration error:', err);
      
      if (axios.isAxiosError(err) && err.response) {
        // Check if the response has validation errors
        if (err.response.data.errors) {
          const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
          setError(errorMessages);
        } else {
          setError(err.response.data.message || 'Registration failed');
        }
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.firstName &&
    formData.lastName &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.agreeToTerms;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-1">
          <img src={Logo} alt="HomeServe Connect" className="mx-auto w-40 mb-1" />
        </div>

        {/* User Type Toggle */}
        <div className="flex rounded-full bg-gray-100 p-1 mb-8">
          <button
            className={`flex-1 py-3 rounded-full text-sm transition-colors
              ${userType === 'homeowner' ? 'bg-green-500 text-white' : 'text-gray-500'}`}
            onClick={() => setUserType('homeowner')}
          >
            Home Owner
          </button>
          <button
            className={`flex-1 py-3 rounded-full text-sm transition-colors
              ${userType === 'maid' ? 'bg-green-500 text-white' : 'text-gray-500'}`}
            onClick={() => setUserType('maid')}
          >
            Maid
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-600 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-b border-gray-300 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-3 border-b border-gray-300 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border-b border-gray-300 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-b border-gray-300 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-b border-gray-300 focus:border-green-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="mt-1 mr-2"
              required
            />
            <label className="text-sm text-gray-600">
              I agree to the{' '}
              <Link to="/terms" className="text-green-500 hover:text-green-600">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-green-500 hover:text-green-600">
                Privacy Policy
              </Link>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 px-4 rounded-full transition-colors
              ${isFormValid && !isLoading
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-green-500 hover:text-green-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
