import { useEffect, useState } from 'react';
import { Box, Card, Chip, Stack, Typography, Button } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getPayments();
      setPayments(response || []);
    } catch (err) {
      setError(err.message || 'Unable to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPayments(); }, []);

  if (loading) return <DashboardLayout role="ADMIN" title="Payments" subtitle="Review mock marketplace transactions."><LoadingState title="Loading payments" description="Preparing the payment overview." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Payments" subtitle="Review mock marketplace transactions."><ErrorState message={error} retryLabel="Try again" onRetry={loadPayments} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Payments" subtitle="Review market-wide payment activity and revenue splits.">
      <PageHeader title="Payments" subtitle="Mock marketplace financial overview with consistent totals." />
      <Stack spacing={2}>
        {payments.map((payment) => (
          <Card key={payment.id} sx={{ p: 3, borderRadius: 3 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography fontWeight={700}>{payment.reference}</Typography>
                <Typography color="text.secondary">{payment.consumer} • {payment.provider} • {payment.api}</Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label={`₹${payment.amount}`} />
                <Chip label={`Fee ₹${payment.platformFee}`} />
                <Chip label={`Provider ₹${payment.providerShare}`} />
                <Chip label={payment.status} />
              </Stack>
            </Stack>
          </Card>
        ))}
      </Stack>
    </DashboardLayout>
  );
};

export default AdminPaymentsPage;
