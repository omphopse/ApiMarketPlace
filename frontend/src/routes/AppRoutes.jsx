import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import LoadingState from '../components/LoadingState';
import ProtectedRoute from './ProtectedRoute';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const RegisterPage = lazy(() => import('../pages/RegisterPage'));
const AdminDashboardPage = lazy(() => import('../pages/AdminDashboardPage'));
const ProviderDashboardPage = lazy(() => import('../pages/ProviderDashboardPage'));
const ConsumerDashboardPage = lazy(() => import('../pages/ConsumerDashboardPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));
const DevRoutesPage = lazy(() => import('../pages/DevRoutesPage'));
const ProviderApisPage = lazy(() => import('../pages/ProviderApisPage'));
const ProviderCreateApiPage = lazy(() => import('../pages/ProviderCreateApiPage'));
const ProviderApiDetailPage = lazy(() => import('../pages/ProviderApiDetailPage'));
const ProviderApiEditPage = lazy(() => import('../pages/ProviderApiEditPage'));
const MarketplacePage = lazy(() => import('../pages/MarketplacePage'));
const ApiDetailsPage = lazy(() => import('../pages/ApiDetailsPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const CheckoutSuccessPage = lazy(() => import('../pages/CheckoutSuccessPage'));
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'));
const SubscriptionDetailsPage = lazy(() => import('../pages/SubscriptionDetailsPage'));
const DocumentationPage = lazy(() => import('../pages/DocumentationPage'));
const ApiKeysPage = lazy(() => import('../pages/ApiKeysPage'));
const UsagePage = lazy(() => import('../pages/UsagePage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const AdminApiApprovalsPage = lazy(() => import('../pages/AdminApiApprovalsPage'));
const AdminApiReviewPage = lazy(() => import('../pages/AdminApiReviewPage'));
const AdminApisPage = lazy(() => import('../pages/AdminApisPage'));
const AdminApiDetailPage = lazy(() => import('../pages/AdminApiDetailPage'));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage'));
const AdminUserDetailPage = lazy(() => import('../pages/AdminUserDetailPage'));
const AdminProvidersPage = lazy(() => import('../pages/AdminProvidersPage'));
const AdminConsumersPage = lazy(() => import('../pages/AdminConsumersPage'));
const AdminCategoriesPage = lazy(() => import('../pages/AdminCategoriesPage'));
const AdminAuditLogsPage = lazy(() => import('../pages/AdminAuditLogsPage'));
const ProviderApiPlansPage = lazy(() => import('../pages/ProviderApiPlansPage'));
const ProviderApiDocumentationPage = lazy(() => import('../pages/ProviderApiDocumentationPage'));
const ProviderApiSubscribersPage = lazy(() => import('../pages/ProviderApiSubscribersPage'));
const ProviderProfilePage = lazy(() => import('../pages/ProviderProfilePage'));

const AppRoutes = () => (
  <Suspense fallback={<LoadingState title="Loading page..." description="Loading content for your route." />}>
    <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />
    <Route path="/dev/routes" element={<DevRoutesPage />} />

    <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
    <Route path="/admin/api-approvals" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApiApprovalsPage /></ProtectedRoute>} />
    <Route path="/admin/api-approvals/:apiId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApiReviewPage /></ProtectedRoute>} />
    <Route path="/admin/apis" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApisPage /></ProtectedRoute>} />
    <Route path="/admin/apis/:apiId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminApiDetailPage /></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsersPage /></ProtectedRoute>} />
    <Route path="/admin/users/:userId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUserDetailPage /></ProtectedRoute>} />
    <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProvidersPage /></ProtectedRoute>} />
    <Route path="/admin/providers/:providerId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProvidersPage /></ProtectedRoute>} />
    <Route path="/admin/consumers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConsumersPage /></ProtectedRoute>} />
    <Route path="/admin/consumers/:consumerId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConsumersPage /></ProtectedRoute>} />
    <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCategoriesPage /></ProtectedRoute>} />
    <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminAuditLogsPage /></ProtectedRoute>} />

    <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderDashboardPage /></ProtectedRoute>} />
    <Route path="/provider/apis" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApisPage /></ProtectedRoute>} />
    <Route path="/provider/apis/create" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderCreateApiPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiDetailPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/edit" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiEditPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/documentation" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiDocumentationPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/plans" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiPlansPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/subscribers" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiSubscribersPage /></ProtectedRoute>} />
    <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderProfilePage /></ProtectedRoute>} />

    <Route path="/consumer/dashboard" element={<ProtectedRoute allowedRoles={['CONSUMER']}><ConsumerDashboardPage /></ProtectedRoute>} />
    <Route path="/marketplace" element={<MarketplacePage />} />
    <Route path="/marketplace/apis/:apiId" element={<ApiDetailsPage />} />
    <Route path="/consumer/checkout/:apiId/:planId" element={<ProtectedRoute allowedRoles={['CONSUMER']}><CheckoutPage /></ProtectedRoute>} />
    <Route path="/consumer/checkout/success" element={<ProtectedRoute allowedRoles={['CONSUMER']}><CheckoutSuccessPage /></ProtectedRoute>} />
    <Route path="/consumer/subscriptions" element={<ProtectedRoute allowedRoles={['CONSUMER']}><SubscriptionsPage /></ProtectedRoute>} />
    <Route path="/consumer/subscriptions/:subscriptionId" element={<ProtectedRoute allowedRoles={['CONSUMER']}><SubscriptionDetailsPage /></ProtectedRoute>} />
    <Route path="/consumer/documentation/:subscriptionId" element={<ProtectedRoute allowedRoles={['CONSUMER']}><DocumentationPage /></ProtectedRoute>} />
    <Route path="/consumer/api-keys" element={<ProtectedRoute allowedRoles={['CONSUMER']}><ApiKeysPage /></ProtectedRoute>} />
    <Route path="/consumer/usage" element={<ProtectedRoute allowedRoles={['CONSUMER']}><UsagePage /></ProtectedRoute>} />
    <Route path="/consumer/profile" element={<ProtectedRoute allowedRoles={['CONSUMER']}><ProfilePage /></ProtectedRoute>} />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
  </Suspense>
);

export default AppRoutes;
