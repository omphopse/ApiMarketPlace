import { useEffect, useState } from 'react';
import { Box, Button, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminConsumersPage = () => {
  const navigate = useNavigate();
  const [consumers, setConsumers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConsumers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getConsumers();
      setConsumers(response || []);
    } catch (err) {
      setError(err.message || 'Unable to load consumers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadConsumers(); }, []);

  if (loading) return <DashboardLayout role="ADMIN" title="Consumers" subtitle="Review consumer activity and subscriptions."><LoadingState title="Loading consumers" description="Fetching consumer records." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Consumers" subtitle="Review consumer activity and subscriptions."><ErrorState message={error} retryLabel="Try again" onRetry={loadConsumers} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Consumers" subtitle="Understand consumer adoption and platform value.">
      <PageHeader title="Consumers" subtitle="Monitor active subscriptions and usage trends." />
      <Box sx={{ display: 'grid', gap: 2 }}>
        {consumers.map((consumer) => (
          <Card key={consumer.id} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography fontWeight={700}>{consumer.name}</Typography>
                <Typography color="text.secondary">{consumer.company}</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`${consumer.subscriptions} subscriptions`} />
                <Chip label={`${consumer.requests} requests`} />
                <Chip label={`Monthly spend ₹${consumer.monthlySpend}`} />
              </Stack>
            </Stack>
            <Button sx={{ mt: 2 }} variant="contained" onClick={() => navigate(`/admin/consumers/${consumer.id}`)}>View consumer</Button>
          </Card>
        ))}
      </Box>
    </DashboardLayout>
  );
};

export default AdminConsumersPage;
