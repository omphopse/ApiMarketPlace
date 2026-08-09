import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminService } from '../services/adminService';
import { statusConfig } from '../config/statusConfig';

const unavailable = 'Not returned by backend';

const AdminApiDetailPage = () => {
  const { apiId } = useParams();
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);

  const loadApi = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getApiById(apiId);
      setApi(result);
    } catch (err) {
      setError(err.message || 'Unable to load API details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApi(); }, [apiId]);

  const handleArchive = async () => {
    await adminService.archiveApi(apiId);
    setArchiveOpen(false);
    await loadApi();
  };

  if (loading) return <DashboardLayout role="ADMIN" title="API details" subtitle="Inspect a marketplace API."><LoadingState title="Loading API" description="Fetching the record details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="API details" subtitle="Inspect a marketplace API."><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return <DashboardLayout role="ADMIN" title="API details" subtitle="Inspect a marketplace API."><Alert severity="warning">The requested API could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="API details" subtitle="Review configuration, plans and activity.">
      <PageHeader title={api.name} subtitle={api.description || 'No description provided.'} action={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate('/admin/apis')}>Back</Button></Stack>} />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} />
        <Chip label={api.categoryName || 'Category unavailable'} variant="outlined" />
        <Chip label={`v${api.version}`} variant="outlined" />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Overview" subtitle="Marketplace and technical summary">
            <Typography>{api.description || 'No description provided.'}</Typography>
            <Typography sx={{ mt: 2 }}><strong>Base URL:</strong> {api.baseUrl || 'Unavailable'}</Typography>
            <Typography><strong>Authentication:</strong> {api.authenticationType || unavailable}</Typography>
            <Typography><strong>Rate Limit:</strong> {api.rateLimit ?? unavailable}{api.rateLimit == null ? '' : ' req/min'}</Typography>
            <Typography><strong>Timeout:</strong> {api.timeout != null ? `${api.timeout}s` : unavailable}</Typography>
          </AppCard>
          <AppCard title="Plans" subtitle="Current pricing tiers" sx={{ mt: 3 }}>
            {api.plans?.length ? (
              api.plans.map((plan) => (
                <Box key={plan.id} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight={700}>{plan.planName || 'Unnamed plan'}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {plan.billingCycle || 'Unknown billing cycle'} • {plan.requestLimit || 0} requests • {plan.active ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}><strong>Price:</strong> {plan.price != null ? `₹${plan.price}` : 'Not provided'}</Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No subscription plans were returned for this API.</Typography>
            )}
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Provider details" subtitle="Ownership and reach">
            <Typography><strong>Provider:</strong> {api.providerName || 'Provider unavailable'}</Typography>
            <Typography><strong>Subscribers:</strong> {api.subscribers || 0}</Typography>
            <Typography><strong>Requests:</strong> {api.requests || 0}</Typography>
            <Typography><strong>Revenue:</strong> ₹{api.revenue || 0}</Typography>
          </AppCard>
          <AppCard title="Review history" subtitle="Moderation actions" sx={{ mt: 3 }}>
            {(api.activity || []).slice(0, 5).map((entry) => <Typography key={entry.id} sx={{ mb: 1 }}>{entry.label}</Typography>)}
            {api.rejectionReason && <Alert severity="warning" sx={{ mt: 1 }}>Rejection reason: {api.rejectionReason}</Alert>}
          </AppCard>
        </Grid>
      </Grid>
      <ConfirmDialog open={archiveOpen} title="Archive this API?" description="Archived APIs will no longer appear in the public marketplace." confirmLabel="Archive API" onClose={() => setArchiveOpen(false)} onConfirm={handleArchive} />
    </DashboardLayout>
  );
};

export default AdminApiDetailPage;
