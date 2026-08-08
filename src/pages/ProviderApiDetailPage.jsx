import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Divider, Card, Tabs, Tab, List, ListItem, ListItemText } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { providerService } from '../services/providerService';
import { statusConfig } from '../config/statusConfig';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { toast } from 'react-toastify';

const ProviderApiDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);

  const loadApi = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await providerService.getApiById(id);
      setApi(result);
    } catch (err) {
      setError(err.message || 'Unable to load API details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApi();
  }, [id]);

  const summaryCards = useMemo(() => [
    { label: 'Subscribers', value: formatNumber(api?.subscribers || 0) },
    { label: 'Requests', value: formatNumber(api?.requests || 0) },
    { label: 'Revenue', value: formatCurrency(api?.revenue || 0) },
    { label: 'Approval', value: statusConfig[api?.status]?.label || api?.status || 'Unknown' }
  ], [api]);

  const handleSubmit = async () => {
    try {
      await providerService.submitApi(api.id);
      toast.success('API submitted for approval.');
      loadApi();
    } catch (err) {
      toast.error(err.message || 'Unable to submit API.');
    }
  };

  if (loading) return <DashboardLayout role="PROVIDER" title="API Details" subtitle="Inspect the current API."><LoadingState title="Loading API" description="Fetching marketplace details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="PROVIDER" title="API Details" subtitle="Inspect the current API."><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return null;

  return (
    <DashboardLayout role="PROVIDER" title="API details" subtitle="Review your listing and manage approval state.">
      <PageHeader title={api.name} subtitle={api.shortDescription} action={<Stack direction="row" spacing={1}><Button component={Link} to={`/provider/apis/${api.id}/edit`} variant="outlined">Edit</Button><Button onClick={handleSubmit} variant="contained">Submit</Button></Stack>} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Overview" subtitle="Current marketplace presentation">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={700}>{api.name}</Typography>
                <Typography color="text.secondary">{api.category} • {api.version}</Typography>
              </Box>
              <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} />
            </Stack>
            <Typography sx={{ mt: 2 }}>{api.fullDescription}</Typography>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              {summaryCards.map((card) => (
                <Grid item xs={6} md={3} key={card.label}>
                  <Card sx={{ p: 2, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">{card.label}</Typography><Typography variant="h6" fontWeight={700}>{card.value}</Typography></Card>
                </Grid>
              ))}
            </Grid>
          </AppCard>
          <AppCard title="Performance" subtitle="Recent product metrics" sx={{ mt: 3 }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab label="Documentation" />
              <Tab label="Plans" />
              <Tab label="Subscribers" />
            </Tabs>
            {tab === 0 && <Box sx={{ mt: 2 }}><Typography whiteSpace="pre-line">{api.documentation?.markdown || 'No documentation published yet.'}</Typography></Box>}
            {tab === 1 && <List>{api.plans?.map((plan) => <ListItem key={plan.id} divider><ListItemText primary={plan.name} secondary={`${plan.billingCycle} • ${formatCurrency(plan.price)} • ${plan.requestLimit} req/mo`} /></ListItem>)}</List>}
            {tab === 2 && <List>{api.subscribersList?.map((item) => <ListItem key={item.email} divider><ListItemText primary={item.name} secondary={item.email} /></ListItem>)}</List>}
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Technical details" subtitle="Integration context">
            <Stack spacing={1.2}>
              <Typography><strong>Base URL:</strong> {api.baseUrl}</Typography>
              <Typography><strong>Auth:</strong> {api.authType}</Typography>
              <Typography><strong>Rate Limit:</strong> {api.rateLimit} req/min</Typography>
              <Typography><strong>Timeout:</strong> {api.timeout}s</Typography>
              <Typography><strong>Support:</strong> {api.supportUrl}</Typography>
              <Typography><strong>Tags:</strong> {api.tags?.join(', ')}</Typography>
            </Stack>
          </AppCard>
          <AppCard title="Quick actions" subtitle="Keep your catalog polished" sx={{ mt: 3 }}>
            <Stack spacing={1}>
              <Button component={Link} to={`/provider/apis/${api.id}/edit`} variant="contained">Edit listing</Button>
              <Button component={Link} to={`/provider/apis/${api.id}/documentation`} variant="outlined">Documentation</Button>
              <Button component={Link} to={`/provider/apis/${api.id}/plans`} variant="outlined">Manage plans</Button>
              <Button component={Link} to={`/provider/apis/${api.id}/subscribers`} variant="outlined">View subscribers</Button>
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ProviderApiDetailPage;
