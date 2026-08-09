import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Grid, Stack, Typography } from '@mui/material';
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
  const [submitting, setSubmitting] = useState(false);

  const loadCheckout = async () => {
    try {
      setLoading(true);
      setError('');
      const foundApi = await consumerService.getMarketplaceApiById(apiId);
      if (!foundApi) throw new Error('API not found.');
      const plans = await consumerService.getApiPlans(apiId);
      const foundPlan = plans?.find((candidate) => candidate.id === planId);
      if (!foundPlan) throw new Error('Plan not found.');
      setApi(foundApi);
      setPlan({ ...foundPlan, name: foundPlan.planName || 'Unnamed plan' });
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

  const handleSubscription = async () => {
    if (!user || user.role !== 'CONSUMER') {
      toast.error('Only consumer developers can complete checkout.');
      return;
    }
    setSubmitting(true);
    try {
      const subscriptionPage = await consumerService.getSubscriptions({ page: 0, size: 100 });
      const existingSubscription = (subscriptionPage?.content || []).find(
        (subscription) => subscription.api?.id === apiId
          && ['ACTIVE', 'PENDING'].includes(String(subscription.status || '').toUpperCase())
      );

      if (existingSubscription?.status === 'ACTIVE') {
        toast.info('You already have an active subscription for this API.');
        navigate(`/consumer/subscriptions/${existingSubscription.subscriptionId}`);
        return;
      }

      if (existingSubscription?.status === 'PENDING') {
        // If existing subscription is pending and plan is free, activate via dev endpoint
        if ((Number(plan.price) || 0) <= 0) {
          const activation = await consumerService.activateSubscription(existingSubscription.subscriptionId);
          toast.success('Existing free subscription activated.');
          navigate('/consumer/checkout/success', { state: { apiId, planId, activation } });
          return;
        }

        // Pending paid subscription: start Razorpay flow for the existing subscription
        toast.info('Creating Razorpay order for existing subscription...');
        const order = await consumerService.createPaymentOrder(existingSubscription.subscriptionId);
        if (!order || !order.orderId || !order.keyId) {
          throw new Error('Unable to create payment order for existing subscription.');
        }

        const loadRazorpay = () => new Promise((resolve, reject) => {
          if (window.Razorpay) return resolve(true);
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = () => resolve(true);
          script.onerror = () => reject(new Error('Unable to load Razorpay checkout script'));
          document.body.appendChild(script);
        });
        try {
          await loadRazorpay();
        } catch (err) {
          throw new Error('Razorpay checkout could not be loaded. Check network or browser blocking.');
        }

        const optionsExisting = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          order_id: order.orderId,
          name: api.name,
          description: plan.name,
          prefill: {
            name: user?.fullName || undefined,
            email: user?.email || undefined
          },
          handler: async function (response) {
            try {
              setSubmitting(true);
              toast.info('Verifying payment...');
              const verification = await consumerService.verifyPayment({
                subscriptionId: existingSubscription.subscriptionId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              });
              toast.success('Payment verified and subscription activated.');
              navigate('/consumer/checkout/success', { state: { apiId, planId, activation: verification } });
            } catch (err) {
              toast.error(err.message || 'Payment verification failed.');
            } finally {
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              toast.info('Payment cancelled. Subscription remains pending.');
            }
          }
        };
        const rzpExisting = new window.Razorpay(optionsExisting);
        rzpExisting.open();
        return;
      }

      const pendingSubscription = await consumerService.createSubscription(apiId, planId);

      // If plan is free, activate immediately via dev endpoint (keeps existing behavior)
      if ((Number(plan.price) || 0) <= 0) {
        const activation = await consumerService.activateSubscription(pendingSubscription.subscriptionId);
        toast.success('Free plan activated.');
        navigate('/consumer/checkout/success', { state: { apiId, planId, activation } });
        return;
      }

      // Paid plan: create Razorpay order and open checkout
      toast.info('Creating Razorpay order...');
      const order = await consumerService.createPaymentOrder(pendingSubscription.subscriptionId);
      if (!order || !order.orderId || !order.keyId) {
        throw new Error('Unable to create payment order.');
      }

      // Load Razorpay script if needed
      const loadRazorpay = () => new Promise((resolve, reject) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error('Unable to load Razorpay checkout script'));
        document.body.appendChild(script);
      });

      try {
        await loadRazorpay();
      } catch (err) {
        throw new Error('Razorpay checkout could not be loaded. Check network or browser blocking.');
      }

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: api.name,
        description: plan.name,
        prefill: {
          name: user?.fullName || undefined,
          email: user?.email || undefined
        },
        handler: async function (response) {
          try {
            setSubmitting(true);
            toast.info('Verifying payment...');
            const verification = await consumerService.verifyPayment({
              subscriptionId: pendingSubscription.subscriptionId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
            toast.success('Payment verified and subscription activated.');
            navigate('/consumer/checkout/success', { state: { apiId, planId, activation: verification } });
          } catch (err) {
            toast.error(err.message || 'Payment verification failed.');
            // keep subscription pending; user may retry
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: function () {
            toast.info('Payment cancelled. Subscription remains pending.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
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
    <DashboardLayout role="CONSUMER" title="Subscription" subtitle="Create and activate a subscription through Spring Boot.">
      <PageHeader title="Activate subscription" subtitle={`Subscribe to ${api.name}`} action={<Button variant="outlined" onClick={() => navigate(`/marketplace/apis/${apiId}`)}>Back</Button>} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <AppCard title="Order summary" subtitle="Review the plan and billing details">
            <Stack spacing={2}>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={700}>{api.name}</Typography>
                <Typography color="text.secondary">{api.providerName || 'Provider unavailable'}</Typography>
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
        <Grid item xs={12} lg={5}><AppCard title="Backend activation" subtitle="The current backend has no payment controller. This uses its explicit development activation endpoint."><Stack spacing={2}><Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Plan price</Typography><Typography variant="h4" fontWeight={700}>{formatCurrency(total)}</Typography></Box><Typography color="text.secondary">No card details or payment success are collected in the frontend. Spring Boot creates the pending subscription and confirms activation.</Typography><Button variant="contained" onClick={handleSubscription} disabled={submitting}>{submitting ? 'Activating…' : 'Create and activate subscription'}</Button></Stack></AppCard></Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default CheckoutPage;
