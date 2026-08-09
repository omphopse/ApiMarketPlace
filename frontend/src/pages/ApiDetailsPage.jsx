import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Grid, Stack, Typography, Avatar, Chip } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ApiMarketplaceCard from '../components/ApiMarketplaceCard';
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
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApi = async () => {
    try {
      setLoading(true); setError('');
      const result = await consumerService.getMarketplaceApiById(apiId);
      if (!result) { setApi(null); return; }
      setApi(result);
      const [planList, market] = await Promise.all([
        consumerService.getApiPlans(apiId),
        consumerService.getMarketplaceApis({ search: result.category?.name || result.category, size: 4, page: 0 })
      ]);
      setPlans(planList || []);
      setRelated((market.content || []).filter((candidate) => candidate.id !== result.id).slice(0, 3));
    } catch (err) { setError(err.message || 'Unable to load API details.'); } finally { setLoading(false); }
  };

  useEffect(() => { loadApi(); }, [apiId]);

  const primaryPlan = useMemo(() => plans.find((p) => Number(p.price) > 0) || plans[0], [plans]);
  const planDisplayName = (plan) => plan?.planName || plan?.name || plan?.title || plan?.label || 'Plan';
  const planPriceLabel = (plan) => (plan ? (Number(plan.price) === 0 ? 'Free' : formatCurrency(plan.price)) : '—');

  const choosePlan = (planId) => {
    if (!planId) { toast.error('No active plan is available.'); return; }
    if (!user) { navigate('/login', { state: { from: `/marketplace/apis/${apiId}` } }); return; }
    if (user.role !== 'CONSUMER') { toast.error('Only consumer accounts can subscribe to APIs.'); return; }
    navigate(`/consumer/checkout/${apiId}/${planId}`);
  };

  if (loading) return <DashboardLayout role="CONSUMER" title="API details"><LoadingState title="Loading API" /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="API details"><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return <DashboardLayout role="CONSUMER" title="API details"><EmptyState title="API not found" description="The backend did not return this marketplace API." actionLabel="Back to marketplace" actionTo="/marketplace" /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title={api.name} subtitle={api.category?.name ? `Marketplace • ${api.category.name}` : 'Marketplace'}>
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Link to="/marketplace">Marketplace</Link>
          <Typography color="text.secondary">/</Typography>
          {api.category?.name ? <Link to={`/marketplace?category=${encodeURIComponent(api.category.name)}`}>{api.category.name}</Link> : null}
          <Typography color="text.secondary">/</Typography>
          <Typography>{api.name}</Typography>
        </Stack>
      </Box>

      {/* Provider meta row */}
      <Box sx={{ mb: 2, maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar src={api.provider?.logoUrl} sx={{ width: 56, height: 56 }}>{api.provider?.name ? api.provider.name.split(' ').map(s=>s[0]).slice(0,2).join('') : null}</Avatar>
          <Box>
            <Typography fontWeight={700}>{api.provider?.name || '—'}</Typography>
            {api.provider?.companyName ? <Typography variant="body2" color="text.secondary">{api.provider.companyName}</Typography> : null}
          </Box>
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
            {api.version && <Typography variant="body2" color="text.secondary">v{api.version}</Typography>}
            {api.status && <Chip label={api.status} size="small" />}
            {api.documentationAvailable ? <Button component={Link} to={`/marketplace/apis/${apiId}/documentation`} variant="outlined" size="small">Docs</Button> : null}
          </Box>
        </Stack>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 2, px: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700}>{api.name}</Typography>
          {api.description ? <Typography color="text.secondary" sx={{ mt: 1 }}>{api.description}</Typography> : <Typography color="text.secondary" sx={{ mt: 1 }}>No description provided.</Typography>}
        </Box>

        {/* Compact stats */}
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item>
              <Typography variant="subtitle2" color="text.secondary">Plans</Typography>
              <Typography fontWeight={700}>{plans.length}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2" color="text.secondary">Primary</Typography>
              <Typography fontWeight={700}>{primaryPlan ? planDisplayName(primaryPlan) : '—'}</Typography>
              <Typography variant="body2" color="text.secondary">{primaryPlan?.requestLimit ? `${primaryPlan.requestLimit} requests` : 'Limit unknown'}</Typography>
            </Grid>
            <Grid item>
              <Typography variant="subtitle2" color="text.secondary">Avg price</Typography>
              <Typography fontWeight={700}>{plans.length ? formatCurrency(plans.reduce((s,p)=>s+Number(p.price||0),0)/plans.length) : '—'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Box>
          <Typography variant="h5" fontWeight={700}>Plans & pricing</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>Choose the plan that fits your usage.</Typography>

          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start', justifyContent: 'center', flexWrap: 'wrap' }}>
            {plans.length ? plans.map((plan) => {
              const name = planDisplayName(plan);
              const priceLabel = planPriceLabel(plan);
              return (
                <Box key={plan.id} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: plan.id === primaryPlan?.id ? 'primary.main' : 'divider', boxShadow: plan.id === primaryPlan?.id ? 6 : 1, minWidth: 260 }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={800} sx={{ fontSize: 18 }}>{name}</Typography>
                      <Typography fontWeight={800}>{priceLabel}</Typography>
                    </Stack>
                    {plan.requestLimit ? <Typography color="text.secondary">{plan.requestLimit} requests</Typography> : <Typography color="text.secondary">Request limit not specified</Typography>}
                    <Box sx={{ pt: 2 }}>
                      <Button variant={plan.id === primaryPlan?.id ? 'contained' : 'outlined'} onClick={() => choosePlan(plan.id)}>{plan.id === primaryPlan?.id ? 'Selected' : 'Choose plan'}</Button>
                    </Box>
                  </Stack>
                </Box>
              );
            }) : <Alert severity="info">No plans were returned for this API.</Alert>}
          </Box>
        </Box>
      </Box>

      {/* Related APIs */}
      {related.length > 0 && (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 6, px: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Related APIs</Typography>
          <Grid container spacing={2}>
            {related.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id}>
                <ApiMarketplaceCard api={item} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </DashboardLayout>
  );
};

export default ApiDetailsPage;
