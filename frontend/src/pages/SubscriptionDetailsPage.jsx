import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { consumerService } from '../services/consumerService';
import { formatCurrency } from '../utils/formatters';

const SubscriptionDetailsPage = () => {
  const { subscriptionId } = useParams();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubscription = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getSubscriptionById(subscriptionId);
      setSubscription(result);
    } catch (err) {
      setError(err.message || 'Unable to load subscription.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, [subscriptionId]);

  if (loading) return <DashboardLayout role="CONSUMER" title="Subscription details" subtitle="Inspect current access and health."><LoadingState title="Loading subscription" description="Preparing your subscription breakdown." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Subscription details" subtitle="Inspect current access and health."><ErrorState message={error} retryLabel="Try again" onRetry={loadSubscription} /></DashboardLayout>;
  if (!subscription) return <DashboardLayout role="CONSUMER" title="Subscription details" subtitle="Inspect current access and health."><EmptyState title="Subscription not found" description="The requested subscription is unavailable." actionLabel="Back to subscriptions" actionTo="/consumer/subscriptions" /></DashboardLayout>;

  const requestLimit = Number(subscription.requestLimit || 0);
  const requestsUsed = Number(subscription.requestsUsed || 0);
  const pct = requestLimit > 0 ? Math.min(100, Math.round((requestsUsed / requestLimit) * 100)) : 0;

  return (
    <DashboardLayout role="CONSUMER" title="Subscription details" subtitle="Review your current plan and usage.">
      <PageHeader title={subscription.apiName} subtitle={subscription.providerName} action={<Stack direction="row" spacing={1}><Button component={Link} to={`/consumer/documentation/${subscription.id}`} variant="outlined">Documentation</Button><Button component={Link} to="/consumer/api-keys" variant="outlined">API Keys</Button></Stack>} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Plan details" subtitle="Current subscription state">
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>{subscription.planName}</Typography>
                <Typography color="text.secondary">{subscription.billingCycle} • {formatCurrency(subscription.price)}</Typography>
              </Box>
              <Chip label={subscription.status} color={subscription.status === 'ACTIVE' ? 'success' : 'warning'} />
            </Stack>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Started</Typography><Typography fontWeight={700}>{subscription.startedAt ? new Date(subscription.startedAt).toLocaleDateString() : 'Not available'}</Typography></Box></Grid>
              <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Renewal</Typography><Typography fontWeight={700}>{subscription.renewalDate}</Typography></Box></Grid>
              <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Request limit</Typography><Typography fontWeight={700}>{subscription.requestLimit}</Typography></Box></Grid>
            </Grid>
          </AppCard>
          <AppCard title="Usage" subtitle="Current consumption" sx={{ mt: 3 }}>
            <Stack spacing={2}>
              <Box><Typography variant="caption" color="text.secondary">Requests Used</Typography><Typography variant="h4" fontWeight={700}>{requestsUsed.toLocaleString('en-IN')}</Typography></Box>
              <LinearProgress variant="determinate" value={pct} sx={{ height: 10, borderRadius: 999 }} />
              <Typography color="text.secondary">{requestLimit.toLocaleString('en-IN')} request limit • {pct}% used</Typography>
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Quick actions" subtitle="Developer workflows">
            <Stack spacing={1.5}>
              <Button variant="contained" component={Link} to={`/consumer/documentation/${subscription.id}`}>View documentation</Button>
              <Button variant="outlined" component={Link} to="/consumer/api-keys">View API keys</Button>
              <Button variant="outlined" component={Link} to="/consumer/usage">View usage</Button>
            </Stack>
          </AppCard>
          <AppCard title="Performance" subtitle="Current API health" sx={{ mt: 3 }}>
            <Stack spacing={1}>
              <Typography><strong>Success rate:</strong> {subscription.successRate}</Typography>
              <Typography><strong>Response time:</strong> {subscription.responseTime}</Typography>
              <Typography><strong>Docs access:</strong> {subscription.docsAccess ? 'Enabled' : 'Restricted'}</Typography>
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default SubscriptionDetailsPage;
