import { useEffect, useState } from 'react';
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { consumerService } from '../services/consumerService';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const UsagePage = () => {
  const [usage, setUsage] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30d');

  const loadSubscriptions = async () => {
    try {
      const result = await consumerService.getSubscriptions({ page: 0, size: 50, status: 'ACTIVE' });
      const subscriptionList = result.content || [];
      setSubscriptions(subscriptionList);
      if (subscriptionList.length > 0) {
        setSelectedSubscriptionId(subscriptionList[0].subscriptionId);
      }
    } catch (err) {
      setError(err.message || 'Unable to load subscriptions.');
    }
  };

  const loadUsage = async () => {
    if (!selectedSubscriptionId) {
      setUsage(null);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getUsage({ subscriptionId: selectedSubscriptionId, range });
      setUsage(result);
    } catch (err) {
      setError(err.message || 'Unable to load usage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSubscriptions(); }, []);
  useEffect(() => { if (selectedSubscriptionId) loadUsage(); }, [range, selectedSubscriptionId]);

  if (loading) return <DashboardLayout role="CONSUMER" title="Usage" subtitle="Observe request and performance trends."><LoadingState title="Loading usage" description="Preparing your API usage details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Usage" subtitle="Observe request and performance trends."><ErrorState message={error} retryLabel="Try again" onRetry={loadUsage} /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Usage" subtitle="Monitor requests, limits and performance.">
      <PageHeader title="Usage" subtitle="Monitor requests, limits and API performance." action={<Button variant="outlined" onClick={() => loadUsage()}>Refresh</Button>} />
      <AppCard title="Usage filters" subtitle="Adjust the reporting range.">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Range</InputLabel>
            <Select value={range} label="Range" onChange={(event) => setRange(event.target.value)}>
              <MenuItem value="7d">7 Days</MenuItem>
              <MenuItem value="30d">30 Days</MenuItem>
              <MenuItem value="90d">90 Days</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 260 }}>
            <InputLabel>Subscription</InputLabel>
            <Select value={selectedSubscriptionId} label="Subscription" onChange={(event) => setSelectedSubscriptionId(event.target.value)}>
              {subscriptions.map((subscription) => (
                <MenuItem key={subscription.subscriptionId} value={subscription.subscriptionId}>
                  {subscription.api?.name || 'Unknown API'} • {subscription.plan?.name || 'Unknown plan'}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </AppCard>
      <Grid container spacing={3} sx={{ mt: 0.2 }}>
        <Grid item xs={12} md={3}><AppCard title="Total Requests" subtitle={usage?.metrics?.totalRequests?.toLocaleString('en-IN') || '0'} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Successful" subtitle={usage?.metrics?.successfulRequests?.toLocaleString('en-IN') || '0'} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Failed" subtitle={usage?.metrics?.failedRequests?.toLocaleString('en-IN') || '0'} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Success Rate" subtitle={usage?.metrics?.successRate || 'Not available'} /></Grid>
      </Grid>
      {!selectedSubscriptionId && <Box sx={{ mt: 2, color: 'text.secondary' }}>Please select a subscription to view usage.</Box>}
      <Grid container spacing={3} sx={{ mt: 0.2 }}>
        <Grid item xs={12} lg={8}><AppCard title="Requests over time" subtitle="Usage during the selected range"><Box sx={{ height: 280 }}>
            {usage?.requestsSeries?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usage.requestsSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip formatter={(value) => [`${value ?? 0}`, 'Requests']} />
                  <Line type="monotone" dataKey="value" stroke="#1677FF" strokeWidth={3} dot={{ r: 4, fill: '#1677FF', stroke: '#ffffff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>No usage points available for this period.</Box>
            )}
          </Box></AppCard></Grid>
        <Grid item xs={12} lg={4}><AppCard title="Error mix" subtitle="Success and error breakdown"><Box sx={{ height: 260 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Tooltip formatter={(value) => [`${value ?? 0}`, 'Requests']} /><Pie data={usage?.errorSeries || []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} label={({ name }) => name}><Cell fill="#1677FF" /><Cell fill="#F59E0B" /><Cell fill="#DC2626" /></Pie></PieChart></ResponsiveContainer></Box></AppCard></Grid>
      </Grid>
      <AppCard title="Recent requests" subtitle="Latest activity from your subscriptions" sx={{ mt: 3 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ textAlign: 'left', paddingBottom: 10 }}>Time</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>API</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Endpoint</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Method</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Status</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Response</th></tr></thead>
            <tbody>{(usage?.recentRequests || []).map((request) => <tr key={request.id}><td style={{ padding: '8px 0' }}>{request.time}</td><td>{request.api}</td><td>{request.endpoint}</td><td>{request.method}</td><td><Chip label={request.status} size="small" color={request.status >= 400 ? 'error' : 'success'} /></td><td>{request.responseTime}</td></tr>)}</tbody>
          </Box>
        </Box>
      </AppCard>
    </DashboardLayout>
  );
};

export default UsagePage;
