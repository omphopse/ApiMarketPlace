import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Divider, Grid, Stack, Tabs, Tab, Typography } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ApiMarketplaceCard from '../components/ApiMarketplaceCard';
import CodeBlock from '../components/CodeBlock';
import { consumerService } from '../services/consumerService';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';

const ApiDetailsPage = () => {
  const { apiId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [api, setApi] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [related, setRelated] = useState([]);

  const loadApi = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getMarketplaceApiById(apiId);
      if (!result) {
        setApi(null);
        setPlans([]);
        setRelated([]);
        return;
      }
      setApi(result);
      const planList = await consumerService.getApiPlans(apiId);
      setPlans(planList);
      const market = await consumerService.getMarketplaceApis({ search: result.category, size: 4, page: 0 });
      setRelated(market.content.filter((candidate) => candidate.id !== result.id).slice(0, 3));
    } catch (err) {
      setError(err.message || 'Unable to load API details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApi();
  }, [apiId]);

  const primaryPlan = useMemo(() => plans.find((plan) => Number(plan.price) > 0) || plans[0], [plans]);

  const handleChoosePlan = async (planId) => {
    if (!user) {
      navigate('/login', { state: { from: `/marketplace/apis/${apiId}` } });
      return;
    }
    if (user.role !== 'CONSUMER') {
      toast.error('Only consumer developers can subscribe to APIs in mock mode.');
      return;
    }
    navigate(`/consumer/checkout/${apiId}/${planId}`);
  };

  if (loading) return <DashboardLayout role="CONSUMER" title="API details" subtitle="Inspect the marketplace listing."><LoadingState title="Loading API" description="Preparing the product details for you." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="API details" subtitle="Inspect the marketplace listing."><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return <DashboardLayout role="CONSUMER" title="API details" subtitle="Inspect the marketplace listing."><EmptyState title="API not found" description="The requested API is no longer available." actionLabel="Back to marketplace" actionTo="/marketplace" /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="API details" subtitle="Review plans, docs and provider context.">
      <PageHeader title={api.name} subtitle={api.shortDescription} action={<Button variant="contained" onClick={() => handleChoosePlan(primaryPlan?.id)}>Get API</Button>} />
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AppCard title="Overview" subtitle="Everything a developer needs to evaluate the API">
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box component="img" src={api.logo} alt={api.name} sx={{ width: 56, height: 56, borderRadius: 18, objectFit: 'cover' }} />
                <Box>
                  <Typography fontWeight={700}>{api.name}</Typography>
                  <Typography color="text.secondary">{api.providerName || 'Northstar Labs'} • {api.category} • v{api.version}</Typography>
                </Box>
              </Stack>
              <Chip label="Available" color="success" />
            </Stack>
            <Typography sx={{ mt: 2 }}>{api.fullDescription}</Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Authentication</Typography><Typography fontWeight={700}>{api.authType}</Typography></Box></Grid>
              <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Base URL</Typography><Typography fontWeight={700}>{api.baseUrl}</Typography></Box></Grid>
              <Grid item xs={12} md={4}><Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Typography variant="caption" color="text.secondary">Rate Limit</Typography><Typography fontWeight={700}>{api.rateLimit} req/min</Typography></Box></Grid>
            </Grid>
          </AppCard>
          <AppCard title="Developer experience" subtitle="Use tabs to move between pricing, docs and provider details" sx={{ mt: 3 }}>
            <Tabs value={tab} onChange={(_, value) => setTab(value)}>
              <Tab label="Overview" />
              <Tab label="Pricing" />
              <Tab label="Documentation" />
              <Tab label="Provider" />
            </Tabs>
            {tab === 0 && <Box sx={{ mt: 3 }}><Typography fontWeight={700} sx={{ mb: 1 }}>Why teams choose this API</Typography><Typography color="text.secondary">Fast integration, reliable uptime and secure authentication tooling for developer teams.</Typography><Divider sx={{ my: 2 }} /><Stack spacing={1.5}>{['Fast Integration', 'Reliable API', 'Secure Authentication', 'Usage Tracking'].map((feature) => <Box key={feature} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>{feature}</Box>)}</Stack></Box>}
            {tab === 1 && <Box sx={{ mt: 3 }}><Grid container spacing={2}>{plans.map((plan) => <Grid item xs={12} md={6} key={plan.id}><Box sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: plan.id === primaryPlan?.id ? 'primary.main' : 'divider', bgcolor: plan.id === primaryPlan?.id ? 'secondary.main' : 'background.paper' }}><Typography variant="h6" fontWeight={700}>{plan.name}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{plan.description}</Typography><Typography variant="h4" fontWeight={700} sx={{ mt: 2 }}>{plan.price === 0 ? 'Free' : formatCurrency(plan.price)}</Typography><Typography variant="caption" color="text.secondary">{plan.billingCycle}</Typography><Typography sx={{ mt: 2 }}>{plan.requestLimit} requests/month</Typography><Button fullWidth variant={plan.id === primaryPlan?.id ? 'contained' : 'outlined'} sx={{ mt: 2 }} onClick={() => handleChoosePlan(plan.id)}>Choose {plan.name}</Button></Box></Grid>)}</Grid></Box>}
            {tab === 2 && <Box sx={{ mt: 3 }}><Stack spacing={2}><CodeBlock language="bash" title="cURL" code={`curl -H "X-API-Key: YOUR_API_KEY" ${api.baseUrl}/weather/current`} /><CodeBlock language="json" title="Response" code={`{"temperature": 28, "condition": "Clear"}`} /><Typography color="text.secondary">{api.documentation?.markdown || 'Documentation preview for this API will appear here.'}</Typography></Stack></Box>}
            {tab === 3 && <Box sx={{ mt: 3 }}><Typography fontWeight={700}>{api.providerName || 'Northstar Labs'}</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{api.supportUrl || 'https://support.example.com'}</Typography><Divider sx={{ my: 2 }} /><Typography>{api.fullDescription}</Typography></Box>}
          </AppCard>
          <AppCard title="Related APIs" subtitle="Other APIs developers often compare together" sx={{ mt: 3 }}>
            <Grid container spacing={2}>{related.map((item) => <Grid item xs={12} md={4} key={item.id}><ApiMarketplaceCard api={item} /></Grid>)}</Grid>
          </AppCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <AppCard title="Quick actions" subtitle="Jump into your developer workflow">
            <Stack spacing={1.5}>
              <Button variant="contained" onClick={() => handleChoosePlan(primaryPlan?.id)}>Choose plan</Button>
              <Button component={Link} to="/consumer/subscriptions" variant="outlined">View subscriptions</Button>
              <Button component={Link} to="/consumer/api-keys" variant="outlined">API keys</Button>
            </Stack>
          </AppCard>
          <AppCard title="Technical details" subtitle="Implementation context" sx={{ mt: 3 }}>
            <Stack spacing={1}>
              <Typography><strong>Auth:</strong> {api.authType}</Typography>
              <Typography><strong>Base URL:</strong> {api.baseUrl}</Typography>
              <Typography><strong>Version:</strong> {api.version}</Typography>
              <Typography><strong>Response time:</strong> {api.responseTime}</Typography>
              <Typography><strong>Availability:</strong> {api.successRate}</Typography>
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ApiDetailsPage;
