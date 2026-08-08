import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Grid, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';
import { statusConfig } from '../config/statusConfig';

const AdminApisPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [apis, setApis] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'ALL', category: '', provider: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApis = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getApis(filters);
      setApis(response.content || []);
    } catch (err) {
      setError(err.message || 'Unable to load APIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApis(); }, [filters.status, filters.category, filters.provider]);
  useEffect(() => {
    const timeout = setTimeout(() => { loadApis(); }, 250);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  const summary = useMemo(() => ({
    total: apis.length,
    published: apis.filter((api) => ['APPROVED', 'PUBLISHED'].includes(api.status)).length,
    pending: apis.filter((api) => api.status === 'PENDING').length,
    draft: apis.filter((api) => api.status === 'DRAFT').length,
    rejected: apis.filter((api) => api.status === 'REJECTED').length,
    archived: apis.filter((api) => api.status === 'ARCHIVED').length
  }), [apis]);

  if (loading) return <DashboardLayout role="ADMIN" title="API management" subtitle="Monitor all marketplace APIs."><LoadingState title="Loading APIs" description="Preparing the marketplace inventory." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="API management" subtitle="Monitor all marketplace APIs."><ErrorState message={error} retryLabel="Try again" onRetry={loadApis} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="API management" subtitle="Moderate the marketplace catalog.">
      <PageHeader title="All APIs" subtitle="Inspect marketplace-wide API health and moderation state." action={<Button variant="contained" onClick={() => navigate('/admin/api-approvals')}>Review queue</Button>} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total APIs', value: summary.total },
          { label: 'Published', value: summary.published },
          { label: 'Pending', value: summary.pending },
          { label: 'Draft', value: summary.draft },
          { label: 'Rejected', value: summary.rejected },
          { label: 'Archived', value: summary.archived }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={item.label}><Card sx={{ p: 2.5, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">{item.label}</Typography><Typography variant="h5" fontWeight={700}>{item.value}</Typography></Card></Grid>
        ))}
      </Grid>
      <AppCard title="Marketplace catalog" subtitle="Search and filter the full API inventory.">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField label="Search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} fullWidth size="small" />
          <TextField select label="Status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} size="small" sx={{ minWidth: 180 }}>
            {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </TextField>
          <TextField label="Category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })} size="small" />
          <TextField label="Provider" value={filters.provider} onChange={(event) => setFilters({ ...filters, provider: event.target.value })} size="small" />
        </Stack>
        {apis.length === 0 ? <EmptyState title="No APIs found" description="Try broadening the current filters." /> : isMobile ? <Stack spacing={2}>{apis.map((api) => <Card key={api.id} sx={{ p: 2.5, borderRadius: 3 }}><Typography fontWeight={700}>{api.name}</Typography><Typography variant="body2" color="text.secondary">{api.providerName || 'Northstar Labs'} • {api.category}</Typography><Stack direction="row" spacing={1} sx={{ mt: 1 }}><Chip label={statusConfig[api.status]?.label || api.status} size="small" color={statusConfig[api.status]?.color || 'default'} /><Chip label={`${api.plans?.length || 0} plans`} size="small" variant="outlined" /></Stack><Button size="small" variant="contained" sx={{ mt: 2 }} onClick={() => navigate(`/admin/apis/${api.id}`)}>View</Button></Card>)}</Stack> : <Box sx={{ overflowX: 'auto' }}><Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}><Box component="thead"><Box component="tr"><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>API</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Provider</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Category</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Status</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Plans</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Requests</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Revenue</Box><Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Actions</Box></Box></Box><Box component="tbody">{apis.map((api) => <Box component="tr" key={api.id}><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}><Typography fontWeight={700}>{api.name}</Typography></Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{api.providerName || 'Northstar Labs'}</Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{api.category}</Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}><Chip label={statusConfig[api.status]?.label || api.status} size="small" color={statusConfig[api.status]?.color || 'default'} /></Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{api.plans?.length || 0}</Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{api.requests || 0}</Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>₹{api.revenue || 0}</Box><Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}><Button size="small" onClick={() => navigate(`/admin/apis/${api.id}`)}>View</Button></Box></Box>)}</Box></Box></Box>}
      </AppCard>
    </DashboardLayout>
  );
};

export default AdminApisPage;
