import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiIcon from '@mui/icons-material/Api';
import GroupIcon from '@mui/icons-material/Group';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InsightsIcon from '@mui/icons-material/Insights';
import PersonIcon from '@mui/icons-material/Person';
import ExploreIcon from '@mui/icons-material/Explore';
import KeyIcon from '@mui/icons-material/VpnKey';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';

export const navigationConfig = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
    { label: 'API Approvals', path: '/admin/api-approvals', icon: FactCheckIcon },
    { label: 'APIs', path: '/admin/apis', icon: ApiIcon },
    { label: 'Users', path: '/admin/users', icon: GroupIcon },
    { label: 'Providers', path: '/admin/providers', icon: PersonIcon },
    { label: 'Consumers', path: '/admin/consumers', icon: GroupIcon },
    { label: 'Categories', path: '/admin/categories', icon: CategoryIcon },
    { label: 'Payments', path: '/admin/payments', icon: AttachMoneyIcon },
    { label: 'Reports', path: '/admin/reports', icon: BarChartIcon },
    { label: 'Settings', path: '/admin/settings', icon: SettingsIcon }
  ],
  PROVIDER: [
    { label: 'Dashboard', path: '/provider/dashboard', icon: DashboardIcon },
    { label: 'My APIs', path: '/provider/apis', icon: ApiIcon },
    { label: 'Create API', path: '/provider/apis/create', icon: ApiIcon },
    { label: 'Subscribers', path: '/provider/subscribers', icon: GroupIcon },
    { label: 'Revenue', path: '/provider/revenue', icon: AttachMoneyIcon },
    { label: 'Analytics', path: '/provider/analytics', icon: InsightsIcon },
    { label: 'Profile', path: '/provider/profile', icon: PersonIcon }
  ],
  CONSUMER: [
    { label: 'Dashboard', path: '/consumer/dashboard', icon: DashboardIcon },
    { label: 'Explore APIs', path: '/marketplace', icon: ExploreIcon },
    { label: 'My Subscriptions', path: '/consumer/subscriptions', icon: ApiIcon },
    { label: 'API Keys', path: '/consumer/api-keys', icon: KeyIcon },
    { label: 'Usage', path: '/consumer/usage', icon: BarChartIcon },
    { label: 'Billing', path: '/consumer/billing', icon: ReceiptIcon },
    { label: 'Profile', path: '/consumer/profile', icon: PersonIcon }
  ]
};
