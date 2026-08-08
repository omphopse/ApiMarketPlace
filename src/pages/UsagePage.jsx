import { useEffect, useState } from 'react';
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { consumerService } from '../services/consumerService';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

const UsagePage = () => {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30d');

  const loadUsage = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getUsage({ range });
      setUsage(result);
    } catch (err) {
      setError(err.message || 'Unable to load usage.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsage(); }, [range]);

  if (loading) return <DashboardLayout role="CONSUMER" title="Usage" subtitle="Observe request and performance trends."><LoadingState title="Loading usage" description="Preparing your API usage details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Usage" subtitle="Observe request and performance trends."><ErrorState message={error} retryLabel="Try again" onRetry={loadUsage} /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Usage" subtitle="Monitor requests, limits and performance.">
      <PageHeader title="Usage" subtitle="Monitor requests, limits and API performance." action={<Button variant="outlined" onClick={() => loadUsage()}>Refresh</Button>} />
      <AppCard title="Usage filters" subtitle="Adjust the reporting range.">
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel>Range</InputLabel>
          <Select value={range} label="Range" onChange={(event) => setRange(event.target.value)}>
            <MenuItem value="7d">7 Days</MenuItem>
            <MenuItem value="30d">30 Days</MenuItem>
            <MenuItem value="90d">90 Days</MenuItem>
          </Select>
        </FormControl>
      </AppCard>
      <Grid container spacing={3} sx={{ mt: 0.2 }}>
        <Grid item xs={12} md={3}><AppCard title="Total Requests" subtitle={usage?.metrics.totalRequests.toLocaleString('en-IN')} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Successful" subtitle={usage?.metrics.successfulRequests.toLocaleString('en-IN')} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Failed" subtitle={usage?.metrics.failedRequests.toLocaleString('en-IN')} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Success Rate" subtitle={usage?.metrics.successRate} /></Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 0.2 }}>
        <Grid item xs={12} lg={8}><AppCard title="Requests over time" subtitle="Usage during the selected range"><Box sx={{ height: 280 }}><ResponsiveContainer width="100%" height="100%"><BarChart data={usage?.requestsSeries || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#1677FF" /></BarChart></ResponsiveContainer></Box></AppCard></Grid>
        <Grid item xs={12} lg={4}><AppCard title="Error mix" subtitle="Success and error breakdown"><Box sx={{ height: 260 }}><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={usage?.errorSeries || []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}><Cell fill="#1677FF" /><Cell fill="#F59E0B" /><Cell fill="#DC2626" /></Pie></PieChart></ResponsiveContainer></Box></AppCard></Grid>
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
