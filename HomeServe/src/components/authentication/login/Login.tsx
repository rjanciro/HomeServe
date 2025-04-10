import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Logo from '../../../assets/icons/HomeServe_Logo.png';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import { UserType } from '../../../types';
import { authService } from '../../services/auth.service';
import axios from 'axios';

const LoginPage: React.FC = () => {
  useDocumentTitle('Login');
  const navigate = useNavigate();

  const [userType, setUserType] = useState<UserType>('homeowner');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Login and get complete user data
      await authService.login(email, password, userType);
      
      // Make sure we have the complete profile
      await authService.fetchUserProfile();
      
      toast.success('Login successful!');
      const dashboardPath = userType === 'housekeeper' ? '/housekeeper-dashboard' : '/dashboard';
      navigate(dashboardPath);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response.data.message || 'Login failed');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const isFormValid = email && password;

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
              ${userType === 'homeowner' 
                ? 'bg-[#133E87] text-white' 
                : 'text-gray-500'}`}
            onClick={() => setUserType('homeowner')}
          >
            Home Owner
          </button>
          <button
            className={`flex-1 py-3 rounded-full text-sm transition-colors
              ${userType === 'housekeeper' 
                ? 'bg-[#137D13] text-white' 
                : 'text-gray-500'}`}
            onClick={() => setUserType('housekeeper')}
          >
            Housekeeper
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 border-b border-gray-300 focus:outline-none ${
                userType === 'homeowner' 
                  ? 'focus:border-[#133E87]' 
                  : 'focus:border-[#137D13]'
              }`}
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className={`w-full px-4 py-3 border-b border-gray-300 focus:outline-none ${
                  userType === 'homeowner' 
                    ? 'focus:border-[#133E87]' 
                    : 'focus:border-[#137D13]'
                }`}
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className={`text-gray-500 hover:${
              userType === 'homeowner' 
                ? 'text-[#133E87]' 
                : 'text-[#137D13]'
            } text-sm`}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`w-full py-3 px-4 rounded-full transition-colors
              ${isFormValid && !isLoading
                ? userType === 'homeowner'
                  ? 'bg-[#133E87] text-white hover:bg-[#3A80D2]'
                  : 'bg-[#137D13] text-white hover:bg-[#25A025]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className={`${
            userType === 'homeowner' 
              ? 'text-[#133E87] hover:text-[#3A80D2]' 
              : 'text-[#137D13] hover:text-[#25A025]'
          }`}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;