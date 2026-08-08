import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { consumerService } from '../services/consumerService';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const CheckoutPage = () => {
  const { apiId, planId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [api, setApi] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentMode, setPaymentMode] = useState('mock-card');
  const [submitting, setSubmitting] = useState(false);

  const loadCheckout = async () => {
    try {
      setLoading(true);
      setError('');
      const foundApi = await consumerService.getMarketplaceApiById(apiId);
      if (!foundApi) throw new Error('API not found.');
      const foundPlan = foundApi.plans?.find((candidate) => candidate.id === planId);
      if (!foundPlan) throw new Error('Plan not found.');
      setApi(foundApi);
      setPlan(foundPlan);
    } catch (err) {
      setError(err.message || 'Unable to load checkout.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckout();
  }, [apiId, planId]);

  const total = useMemo(() => Number(plan?.price || 0), [plan]);

  const handlePayment = async (mode) => {
    if (!user || user.role !== 'CONSUMER') {
      toast.error('Only consumer developers can complete checkout.');
      return;
    }
    setSubmitting(true);
    try {
      await consumerService.createSubscription(apiId, planId);
      toast.success('Subscription created successfully.');
      navigate('/consumer/checkout/success', { state: { apiId, planId, paymentMode: mode } });
    } catch (err) {
      toast.error(err.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout role="CONSUMER" title="Checkout" subtitle="Finalize your selected plan."><LoadingState title="Preparing checkout" description="Loading your chosen plan and API details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Checkout" subtitle="Finalize your selected plan."><ErrorState message={error} retryLabel="Try again" onRetry={loadCheckout} /></DashboardLayout>;
  if (!api || !plan) return <DashboardLayout role="CONSUMER" title="Checkout" subtitle="Finalize your selected plan."><EmptyState title="Plan not available" description="The selected plan is unavailable for checkout." actionLabel="Back to API" actionTo={`/marketplace/apis/${apiId}`} /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Checkout" subtitle="Secure mock subscription flow.">
      <PageHeader title="Checkout" subtitle={`Subscribe to ${api.name}`} action={<Button variant="outlined" onClick={() => navigate(`/marketplace/apis/${apiId}`)}>Back</Button>} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <AppCard title="Order summary" subtitle="Review the plan and billing details">
            <Stack spacing={2}>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={700}>{api.name}</Typography>
                <Typography color="text.secondary">{api.providerName || 'Northstar Labs'}</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={700}>{plan.name}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>{plan.description}</Typography>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                  <Typography>Request limit</Typography>
                  <Typography fontWeight={700}>{plan.requestLimit} req/mo</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                  <Typography>Billing cycle</Typography>
                  <Typography fontWeight={700}>{plan.billingCycle}</Typography>
                </Stack>
              </Box>
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} lg={5}>
          <AppCard title="Demo payment" subtitle="Mock checkout only">
            <Stack spacing={2}>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Total due</Typography>
                <Typography variant="h4" fontWeight={700}>{formatCurrency(total)}</Typography>
              </Box>
              <TextField label="Card name" defaultValue={user?.name || 'Developer'} />
              <TextField label="Card number" defaultValue="4242 4242 4242 4242" />
              <Stack direction="row" spacing={2}>
                <TextField label="Expiry" defaultValue="12/28" />
                <TextField label="CVC" defaultValue="123" />
              </Stack>
              <Divider />
              <Stack spacing={1.5}>
                <Button variant="contained" onClick={() => handlePayment('mock-card')} disabled={submitting}>Subscribe for {formatCurrency(total)}</Button>
                <Button variant="outlined" onClick={() => handlePayment('mock-upi')} disabled={submitting}>Simulate UPI payment</Button>
              </Stack>
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default CheckoutPage;
