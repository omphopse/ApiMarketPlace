import DashboardIcon from '@mui/icons-material/Dashboard';
import ApiIcon from '@mui/icons-material/Api';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import ExploreIcon from '@mui/icons-material/Explore';
import KeyIcon from '@mui/icons-material/VpnKey';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import CategoryIcon from '@mui/icons-material/Category';
import BarChartIcon from '@mui/icons-material/BarChart';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';

export const navigationConfig = {
  ADMIN: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: DashboardIcon },
    { label: 'API Approvals', path: '/admin/api-approvals', icon: FactCheckIcon },
    { label: 'APIs', path: '/admin/apis', icon: ApiIcon },
    { label: 'Users', path: '/admin/users', icon: GroupIcon },
    { label: 'Providers', path: '/admin/providers', icon: PersonIcon },
    { label: 'Consumers', path: '/admin/consumers', icon: GroupIcon },
    { label: 'Categories', path: '/admin/categories', icon: CategoryIcon },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ManageSearchIcon }
  ],
  PROVIDER: [
    { label: 'Dashboard', path: '/provider/dashboard', icon: DashboardIcon },
    { label: 'My APIs', path: '/provider/apis', icon: ApiIcon },
    { label: 'Create API', path: '/provider/apis/create', icon: ApiIcon },
    { label: 'Profile', path: '/provider/profile', icon: PersonIcon }
  ],
  CONSUMER: [
    { label: 'Dashboard', path: '/consumer/dashboard', icon: DashboardIcon },
    { label: 'Explore APIs', path: '/marketplace', icon: ExploreIcon },
    { label: 'My Subscriptions', path: '/consumer/subscriptions', icon: ApiIcon },
    { label: 'API Keys', path: '/consumer/api-keys', icon: KeyIcon },
    { label: 'Usage', path: '/consumer/usage', icon: BarChartIcon },
    { label: 'Profile', path: '/consumer/profile', icon: PersonIcon }
  ]
};
