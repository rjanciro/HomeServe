import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';

const VerificationPending = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const [pin, setPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [resendStatus, setResendStatus] = useState('');

  const handleVerifyPin = async () => {
    if (!email || !pin || pin.length !== 6) {
      setVerificationStatus('error');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('');
    
    try {
      const response = await authService.verifyPin(email, pin);
      setVerificationStatus('success');
      
      // Redirect after a short delay
      setTimeout(() => {
        const user = authService.getCurrentUser();
        navigate(`/${user?.userType === 'homeowner' ? 'homeowner' : 'provider'}/dashboard`);
      }, 2000);
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setVerificationStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setResendStatus('error');
      return;
    }

    setIsResending(true);
    setResendStatus('');
    
    try {
      await authService.resendVerificationEmail(email);
      setResendStatus('success');
    } catch (error) {
      console.error('Error resending verification email:', error);
      setResendStatus('error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">Verify Your Email</h2>
        
        <div className="text-center">
          <p className="mb-4 text-gray-600">
            We've sent a verification code to <span className="font-semibold">{email}</span>.
          </p>
          <p className="mb-6 text-gray-600">
            Please check your inbox and enter the 6-digit code below.
          </p>
          
          <div className="mb-6">
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              id="pin"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
              maxLength={6}
            />
          </div>
          
          <div className="mb-4">
            <button
              onClick={handleVerifyPin}
              disabled={isVerifying || pin.length !== 6}
              className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isVerifying ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
          
          {verificationStatus === 'success' && (
            <p className="mb-4 text-green-600">Your email has been successfully verified!</p>
          )}
          
          {verificationStatus === 'error' && (
            <p className="mb-4 text-red-600">Invalid or expired verification code. Please try again.</p>
          )}
          
          <hr className="my-6 border-gray-200" />
          
          <p className="mb-4 text-gray-600">
            Didn't receive the code?
          </p>
          
          <div className="mb-4">
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className="text-blue-500 hover:underline"
            >
              {isResending ? 'Sending...' : 'Resend verification code'}
            </button>
          </div>
          
          {resendStatus === 'success' && (
            <p className="mb-4 text-green-600">Verification code has been resent successfully!</p>
          )}
          
          {resendStatus === 'error' && (
            <p className="mb-4 text-red-600">Failed to resend verification code. Please try again.</p>
          )}
          
          <button
            onClick={() => navigate('/login')}
            className="text-blue-500 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationPending;
