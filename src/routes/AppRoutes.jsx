import { Navigate, Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import ProviderDashboardPage from '../pages/ProviderDashboardPage';
import ConsumerDashboardPage from '../pages/ConsumerDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import ProtectedRoute from './ProtectedRoute';
import ComingSoonPage from '../components/ComingSoonPage';
import DevRoutesPage from '../pages/DevRoutesPage';
import ProviderApisPage from '../pages/ProviderApisPage';
import ProviderCreateApiPage from '../pages/ProviderCreateApiPage';
import ProviderApiDetailPage from '../pages/ProviderApiDetailPage';
import ProviderApiEditPage from '../pages/ProviderApiEditPage';
import MarketplacePage from '../pages/MarketplacePage';
import ApiDetailsPage from '../pages/ApiDetailsPage';
import CheckoutPage from '../pages/CheckoutPage';
import CheckoutSuccessPage from '../pages/CheckoutSuccessPage';
import SubscriptionsPage from '../pages/SubscriptionsPage';
import SubscriptionDetailsPage from '../pages/SubscriptionDetailsPage';
import DocumentationPage from '../pages/DocumentationPage';
import ApiKeysPage from '../pages/ApiKeysPage';
import UsagePage from '../pages/UsagePage';
import BillingPage from '../pages/BillingPage';
import ProfilePage from '../pages/ProfilePage';
import AdminApiApprovalsPage from '../pages/AdminApiApprovalsPage';
import AdminApiReviewPage from '../pages/AdminApiReviewPage';
import AdminApisPage from '../pages/AdminApisPage';
import AdminApiDetailPage from '../pages/AdminApiDetailPage';
import AdminUsersPage from '../pages/AdminUsersPage';
import AdminUserDetailPage from '../pages/AdminUserDetailPage';
import AdminProvidersPage from '../pages/AdminProvidersPage';
import AdminProviderDetailPage from '../pages/AdminProviderDetailPage';
import AdminConsumersPage from '../pages/AdminConsumersPage';
import AdminConsumerDetailPage from '../pages/AdminConsumerDetailPage';
import AdminCategoriesPage from '../pages/AdminCategoriesPage';
import AdminPaymentsPage from '../pages/AdminPaymentsPage';
import AdminReportsPage from '../pages/AdminReportsPage';
import AdminActivityPage from '../pages/AdminActivityPage';
import AdminSettingsPage from '../pages/AdminSettingsPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
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
    <Route path="/admin/providers/:providerId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminProviderDetailPage /></ProtectedRoute>} />
    <Route path="/admin/consumers" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConsumersPage /></ProtectedRoute>} />
    <Route path="/admin/consumers/:consumerId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminConsumerDetailPage /></ProtectedRoute>} />
    <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminCategoriesPage /></ProtectedRoute>} />
    <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminPaymentsPage /></ProtectedRoute>} />
    <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminReportsPage /></ProtectedRoute>} />
    <Route path="/admin/activity" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminActivityPage /></ProtectedRoute>} />
    <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminSettingsPage /></ProtectedRoute>} />

    <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderDashboardPage /></ProtectedRoute>} />
    <Route path="/provider/apis" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApisPage /></ProtectedRoute>} />
    <Route path="/provider/apis/create" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderCreateApiPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiDetailPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/edit" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ProviderApiEditPage /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/documentation" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Documentation" description="Manage API references and usage guides." plannedFeatures={['Docs editor', 'Examples', 'Versioned guides']} backPath="/provider/dashboard" /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/plans" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Plan Management" description="Adjust pricing and access tiers." plannedFeatures={['Plan editor', 'Billing controls', 'Feature gating']} backPath="/provider/dashboard" /></ProtectedRoute>} />
    <Route path="/provider/apis/:id/subscribers" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Subscribers" description="Inspect active customers by API." plannedFeatures={['Usage insights', 'Renewal health', 'Support notes']} backPath="/provider/dashboard" /></ProtectedRoute>} />
    <Route path="/provider/subscribers" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Subscribers" description="Monitor active customers and renewal health." plannedFeatures={['Subscriber insights', 'Usage alerts', 'Renewal reminders']} backPath="/provider/dashboard" /></ProtectedRoute>} />
    <Route path="/provider/revenue" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Revenue Overview" description="Track payouts, invoices, and monetization history." plannedFeatures={['Revenue trends', 'Payout schedules', 'Forecasts']} backPath="/provider/dashboard" /></ProtectedRoute>} />
    <Route path="/provider/analytics" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Analytics" description="Understand request patterns and developer engagement." plannedFeatures={['Usage charts', 'Cohort insights', 'Retention summaries']} backPath="/provider/dashboard" /></ProtectedRoute>} />
    <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['PROVIDER']}><ComingSoonPage title="Profile" description="Maintain your provider profile and company details." plannedFeatures={['Profile editing', 'Verification docs', 'Social proof']} backPath="/provider/dashboard" /></ProtectedRoute>} />

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
    <Route path="/consumer/billing" element={<ProtectedRoute allowedRoles={['CONSUMER']}><BillingPage /></ProtectedRoute>} />
    <Route path="/consumer/profile" element={<ProtectedRoute allowedRoles={['CONSUMER']}><ProfilePage /></ProtectedRoute>} />

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRoutes;
