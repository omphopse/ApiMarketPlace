import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ProviderDashboardPage from './pages/ProviderDashboardPage';
import ConsumerDashboardPage from './pages/ConsumerDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import { getStoredUser } from './utils/auth';

const ProtectedRoute = ({ children, allowedRole }) => {
  const user = getStoredUser();
  if (!user?.token) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRole="ROLE_ADMIN"><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/provider" element={<ProtectedRoute allowedRole="ROLE_PROVIDER"><ProviderDashboardPage /></ProtectedRoute>} />
      <Route path="/consumer" element={<ProtectedRoute allowedRole="ROLE_CONSUMER"><ConsumerDashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
