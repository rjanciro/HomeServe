import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/pages/LandingPage';
import Login from './components/authentication/login/Login';
import AdminLogin from './components/authentication/login/AdminLogin';
import Register from './components/authentication/register/Register';
import HomeownerDashboard from './components/dashboard/home-owner/HomeownerDashboard';
import MaidDashboard from './components/dashboard/maid/MaidDashboard';
import FindServices from './components/pages/home-owner/FindServices';
import HomeOwnerSidebar from './components/layout/HomeOwnerSidebar';
import MaidSidebar from './components/layout/MaidSidebar';
import History from './components/pages/home-owner/History';
import Messaging from './components/pages/home-owner/HomeOwnerMessaging';
import HomeOwnerProfileSettings from './components/pages/home-owner/HomeOwnerProfileSettings';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/guards/PrivateRoute';
import AboutUsPage from './components/pages/AboutUsPage';
// import MyServices from './components/pages/service-provider/MyServices';
import MaidMessaging from './components/pages/maid/MaidMessaging';
import MaidProfileSettings from './components/pages/maid/MaidProfileSettings';
import AdminSidebar from './components/layout/AdminSidebar';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import PrivateAdminRoute from './components/routes/PrivateAdminRoute';
import { MessagingProvider } from './contexts/MessagingContext';
import UsersServiceProvidersPage from './components/pages/admin/user-management/UsersServiceProviders';
import ProviderVerificationDetailsPage from './components/pages/admin/user-management/ProviderVerificationDetails';
// import VerificationDocumentsPage from './components/pages/service-provider/VerificationDocuments';
// import BookingRequests from './components/pages/service-provider/BookingRequests';
import EmailVerification from './components/authentication/EmailVerification';
import VerificationPending from './components/authentication/VerificationPending';

const App: React.FC = () => {
  return (
    <>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            fontSize: '14px'
          },
          success: {
            style: {
              background: '#22c55e',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#22c55e',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
            iconTheme: {
              primary: 'white',
              secondary: '#ef4444',
            },
          },
        }}
      />
      <MessagingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/signup" element={<Register />} />
            
            {/* Homeowner routes */}
            <Route element={<PrivateRoute element={<HomeOwnerSidebar />} userType="homeowner" />}>
              <Route path="/dashboard" element={<HomeownerDashboard />} />
              <Route path="/find-services" element={<FindServices />} />
              <Route path="/history" element={<History />} />
              <Route path="/messages" element={<Messaging />} />
              <Route path="/profile" element={<HomeOwnerProfileSettings />} />
            </Route>

            {/* Maid routes */}
            <Route element={<PrivateRoute element={<MaidSidebar />} userType="maid" />}>
              <Route path="/maid-dashboard" element={<MaidDashboard />} />
              {/* <Route path="/maid/my-services" element={<MyServices />} /> */}
              {/* <Route path="/maid/booking-requests" element={<BookingRequests />} /> */}
              <Route path="/maid/messages" element={<MaidMessaging />} />
              <Route path="/maid/profile" element={<MaidProfileSettings />} />
              {/* <Route path="/maid/verification-documents" element={<VerificationDocumentsPage />} /> */}
            </Route>

            {/* Admin routes */}
            <Route element={<PrivateAdminRoute element={<AdminSidebar />} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/service-providers" element={<UsersServiceProvidersPage />} />
              <Route path="/admin/service-providers/:userId" element={<ProviderVerificationDetailsPage />} />
            </Route>

            {/* Email verification routes */}
            <Route path="/verification-pending" element={<VerificationPending />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </MessagingProvider>
    </>
  );
};

export default App;
