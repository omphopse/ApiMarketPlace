import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminConsumerDetailPage = () => {
  const { consumerId } = useParams();
  const navigate = useNavigate();
  const [consumer, setConsumer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConsumer = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getConsumerById(consumerId);
      setConsumer(result);
    } catch (err) {
      setError(err.message || 'Unable to load consumer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConsumer(); }, [consumerId]);

  if (loading) return <DashboardLayout role="ADMIN" title="Consumer details" subtitle="Inspect activity and subscriptions."><LoadingState title="Loading consumer" description="Fetching consumer profile." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Consumer details" subtitle="Inspect activity and subscriptions."><ErrorState message={error} retryLabel="Try again" onRetry={loadConsumer} /></DashboardLayout>;
  if (!consumer) return <DashboardLayout role="ADMIN" title="Consumer details" subtitle="Inspect activity and subscriptions."><Alert severity="warning">The requested consumer could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Consumer details" subtitle="Review subscriptions, usage and billing context.">
      <PageHeader title={consumer.name} subtitle={consumer.company} action={<Button variant="outlined" onClick={() => navigate('/admin/consumers')}>Back</Button>} />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label={`${consumer.subscriptions} subscriptions`} />
        <Chip label={`${consumer.requests} requests`} />
        <Chip label={`₹${consumer.monthlySpend} monthly spend`} />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Profile" subtitle="Consumer overview">
            <Typography><strong>Consumer:</strong> {consumer.name}</Typography>
            <Typography><strong>Company:</strong> {consumer.company}</Typography>
            <Typography><strong>Joined:</strong> {consumer.joinedAt}</Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Security" subtitle="Sensitive data handling">
            <Typography color="text.secondary">Raw API keys are masked and never exposed in the admin experience.</Typography>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminConsumerDetailPage;
