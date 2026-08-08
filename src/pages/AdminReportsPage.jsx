import { useEffect, useState } from 'react';
import { Box, Button, Card, Grid, Stack, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';
import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AdminReportsPage = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getReports();
      setReport(response);
    } catch (err) {
      setError(err.message || 'Unable to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, []);

  if (loading) return <DashboardLayout role="ADMIN" title="Reports" subtitle="Platform analytics and reporting."><LoadingState title="Loading reports" description="Preparing the marketplace analytics view." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Reports" subtitle="Platform analytics and reporting."><ErrorState message={error} retryLabel="Try again" onRetry={loadReport} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Reports" subtitle="Assess adoption, moderation outcomes and revenue growth.">
      <PageHeader title="Reports" subtitle="Clear overview of platform health and growth." action={<Button variant="contained" onClick={() => adminService.exportReports()}>Export CSV</Button>} />
      <Grid container spacing={3}>
        {[
          { label: 'User Growth', value: report.metrics.totalUsers },
          { label: 'Provider Growth', value: report.metrics.totalProviders },
          { label: 'Consumer Growth', value: report.metrics.totalConsumers },
          { label: 'API Growth', value: report.metrics.totalApis },
          { label: 'Subscription Growth', value: report.metrics.subscriptions },
          { label: 'Marketplace Revenue', value: `₹${report.metrics.revenue}` }
        ].map((item) => <Grid item xs={12} sm={6} md={4} key={item.label}><Card sx={{ p: 2.5, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">{item.label}</Typography><Typography variant="h5" fontWeight={700}>{item.value}</Typography></Card></Grid>)}
      </Grid>
      <Grid container spacing={3} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={6}><AppCard title="Users over time" subtitle="Growth trajectory"><Box sx={{ height: 240 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={report.userGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke="#1677FF" fill="#1677FF" fillOpacity={0.18} /></AreaChart></ResponsiveContainer></Box></AppCard></Grid>
        <Grid item xs={12} md={6}><AppCard title="Revenue over time" subtitle="Platform financial health"><Box sx={{ height: 240 }}><ResponsiveContainer width="100%" height="100%"><AreaChart data={report.revenueGrowth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="value" stroke="#0D3B66" fill="#0D3B66" fillOpacity={0.14} /></AreaChart></ResponsiveContainer></Box></AppCard></Grid>
      </Grid>
      <AppCard title="Key metrics" subtitle="Summary indicators" sx={{ mt: 3 }}>
        <Typography><strong>Approval Rate:</strong> {report.approvalRate}%</Typography>
      </AppCard>
    </DashboardLayout>
  );
};

export default AdminReportsPage;
