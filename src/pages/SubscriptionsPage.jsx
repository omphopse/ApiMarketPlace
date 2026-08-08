import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { consumerService } from '../services/consumerService';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';

const statusOptions = ['ALL', 'ACTIVE', 'PENDING', 'CANCELLED', 'EXPIRED'];

const SubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'ALL', sort: 'NEWEST' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getSubscriptions(filters);
      setSubscriptions(result);
    } catch (err) {
      setError(err.message || 'Unable to load subscriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSubscriptions();
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.search, filters.status, filters.sort]);

  const summary = useMemo(() => ({
    active: subscriptions.filter((item) => item.status === 'ACTIVE').length,
    pending: subscriptions.filter((item) => item.status === 'PENDING').length,
    cancelled: subscriptions.filter((item) => item.status === 'CANCELLED').length,
    monthlySpend: subscriptions.reduce((sum, item) => sum + (item.status === 'ACTIVE' ? item.price : 0), 0)
  }), [subscriptions]);

  const requestCancel = (subscription) => {
    setSelectedSubscription(subscription);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (!selectedSubscription) return;
    try {
      await consumerService.cancelSubscription(selectedSubscription.id);
      toast.success('Subscription cancelled.');
      setConfirmOpen(false);
      loadSubscriptions();
    } catch (err) {
      toast.error(err.message || 'Unable to cancel subscription.');
    }
  };

  return (
    <DashboardLayout role="CONSUMER" title="My subscriptions" subtitle="Manage your active API access.">
      <PageHeader title="My Subscriptions" subtitle="Track usage, renewals and lifecycle state." action={<Button component={Link} to="/marketplace" variant="contained">Explore APIs</Button>} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} md={3}><AppCard title="Active" subtitle={summary.active} /></Grid>
        <Grid item xs={6} md={3}><AppCard title="Pending" subtitle={summary.pending} /></Grid>
        <Grid item xs={6} md={3}><AppCard title="Cancelled" subtitle={summary.cancelled} /></Grid>
        <Grid item xs={6} md={3}><AppCard title="Monthly Spend" subtitle={formatCurrency(summary.monthlySpend)} /></Grid>
      </Grid>
      <AppCard title="Search and filter" subtitle="Narrow down your subscription list.">
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}><TextField label="Search APIs" fullWidth value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} /></Grid>
          <Grid item xs={12} md={3}><FormControl fullWidth><InputLabel>Status</InputLabel><Select value={filters.status} label="Status" onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>{statusOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}</Select></FormControl></Grid>
          <Grid item xs={12} md={4}><FormControl fullWidth><InputLabel>Sort</InputLabel><Select value={filters.sort} label="Sort" onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}><MenuItem value="NEWEST">Newest</MenuItem><MenuItem value="RENEWAL">Renewal Date</MenuItem><MenuItem value="PRICE">Price</MenuItem></Select></FormControl></Grid>
        </Grid>
      </AppCard>
      <AppCard title="Subscriptions" subtitle="Your connected APIs and access plans" sx={{ mt: 3 }}>
        {loading ? <LoadingState title="Loading subscriptions" description="Refreshing your current plan access." /> : error ? <ErrorState message={error} retryLabel="Try again" onRetry={loadSubscriptions} /> : subscriptions.length === 0 ? <EmptyState title="No subscriptions yet" description="Explore the marketplace and connect your first API." actionLabel="Explore APIs" actionTo="/marketplace" /> : <Stack spacing={2}>{subscriptions.map((subscription) => <Box key={subscription.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}><Box><Typography fontWeight={700}>{subscription.apiName}</Typography><Typography color="text.secondary">{subscription.providerName} • {subscription.planName}</Typography></Box><Chip label={subscription.status} color={subscription.status === 'ACTIVE' ? 'success' : subscription.status === 'PENDING' ? 'warning' : 'default'} /><Box><Typography variant="body2" color="text.secondary">Renewal {subscription.renewalDate}</Typography><Typography fontWeight={700}>{formatCurrency(subscription.price)}</Typography></Box><Stack direction="row" spacing={1}><Button component={Link} to={`/consumer/subscriptions/${subscription.id}`} variant="outlined">View</Button><Button component={Link} to={`/consumer/documentation/${subscription.id}`} variant="outlined">Docs</Button><Button color="error" onClick={() => requestCancel(subscription)}>Cancel</Button></Stack></Stack></Box>)}</Stack>}
      </AppCard>
      <ConfirmDialog open={confirmOpen} title="Cancel subscription?" description="This will revoke access for the selected API and stop future usage." confirmLabel="Cancel subscription" onClose={() => setConfirmOpen(false)} onConfirm={confirmCancel} />
    </DashboardLayout>
  );
};

export default SubscriptionsPage;
