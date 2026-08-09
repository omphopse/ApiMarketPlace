import { useEffect, useState } from 'react';
import { Alert, Box, Button, Divider, Grid, Stack, Typography } from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import { toast } from 'react-toastify';

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [checkoutState, setCheckoutState] = useState(() => location.state || null);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (location.state?.activation?.apiKey) setApiKey(location.state.activation.apiKey);
  }, [location.state]);

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      toast.success('API key copied.');
    } catch {
      toast.error('Unable to copy API key.');
    }
  };

  return (
    <DashboardLayout role="CONSUMER" title="Subscription result" subtitle="Showing the backend activation response.">
      {!checkoutState?.activation ? <Alert severity="warning">No recent activation response is available. Open a subscription from the marketplace to start this flow.</Alert> : <>
      <PageHeader title="Subscription activated" subtitle="Spring Boot confirmed the subscription activation." action={<Button component={Link} to="/consumer/subscriptions" variant="outlined">View subscriptions</Button>} />
      <AppCard title="Access delivered" subtitle="Your subscription is now active and the API key is ready to use.">
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Stack spacing={2}>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Subscription status</Typography>
                <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>{checkoutState.activation.status || 'Unavailable'}</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">API</Typography>
                <Typography fontWeight={700}>{checkoutState.apiId || 'Unavailable'}</Typography>
              </Box>
              <Box sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" color="text.secondary">Plan</Typography>
                <Typography fontWeight={700}>{checkoutState.planId || 'Unavailable'}</Typography>
              </Box>
            </Stack>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'secondary.main', border: '1px solid', borderColor: 'divider' }}>
              <Typography fontWeight={700}>Your API key</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Copy it now. The full key is shown once and otherwise remains masked in the UI.</Typography>
              <Divider sx={{ my: 2 }} />
              {apiKey ? <>
                <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{apiKey}</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                  <Button variant="contained" onClick={copyKey}>Copy API key</Button>
                  <Button variant="outlined" onClick={() => navigate('/consumer/api-keys')}>View API keys</Button>
                </Stack>
              </> : <Typography color="text.secondary">For security, the full API key is no longer displayed on the page.</Typography>}
            </Box>
          </Grid>
        </Grid>
      </AppCard></>}
    </DashboardLayout>
  );
};

export default CheckoutSuccessPage;
