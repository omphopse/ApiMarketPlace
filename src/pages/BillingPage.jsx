import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { consumerService } from '../services/consumerService';
import { formatCurrency } from '../utils/formatters';

const BillingPage = () => {
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadBilling = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getBilling();
      setBilling(result);
    } catch (err) {
      setError(err.message || 'Unable to load billing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBilling(); }, []);

  if (loading) return <DashboardLayout role="CONSUMER" title="Billing" subtitle="Review your mock billing history."><LoadingState title="Loading billing" description="Preparing your billing overview." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Billing" subtitle="Review your mock billing history."><ErrorState message={error} retryLabel="Try again" onRetry={loadBilling} /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Billing" subtitle="Review invoices and payment activity.">
      <PageHeader title="Billing" subtitle="Review invoices, active plans and billing history." action={<Button variant="outlined" onClick={() => loadBilling()}>Refresh</Button>} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}><AppCard title="Monthly spend" subtitle={formatCurrency(billing?.monthlySpend || 0)} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Active paid plans" subtitle={billing?.activePaidPlans || 0} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Next payment" subtitle={billing?.nextPayment || '—'} /></Grid>
        <Grid item xs={12} md={3}><AppCard title="Total spent" subtitle={formatCurrency(billing?.totalSpent || 0)} /></Grid>
      </Grid>
      <AppCard title="Billing history" subtitle="Mock invoices created for the phase 3 experience" sx={{ mt: 3 }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th style={{ textAlign: 'left', paddingBottom: 10 }}>Date</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>API</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Plan</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Amount</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Status</th><th style={{ textAlign: 'left', paddingBottom: 10 }}>Reference</th></tr></thead>
            <tbody>{(billing?.history || []).map((item) => <tr key={item.id}><td style={{ padding: '8px 0' }}>{item.date}</td><td>{item.api}</td><td>{item.plan}</td><td>{formatCurrency(item.amount)}</td><td><Chip label={item.status} size="small" /></td><td>{item.reference}</td></tr>)}</tbody>
          </Box>
        </Box>
      </AppCard>
    </DashboardLayout>
  );
};

export default BillingPage;
