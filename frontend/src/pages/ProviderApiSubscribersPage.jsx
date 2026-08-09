import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Pagination, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { providerService } from '../services/providerService';
import { formatCurrency, formatDate } from '../utils/formatters';

const ProviderApiSubscribersPage = () => {
  const { id } = useParams();
  const [subscribers, setSubscribers] = useState([]);
  const [pagination, setPagination] = useState({ page: 0, size: 10, totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSubscribers = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      setError('');
      const response = await providerService.getSubscribers(id, page, size);
      setSubscribers(response.content || []);
      setPagination({
        page: response.page,
        size: response.size,
        totalPages: response.totalPages,
        totalElements: response.totalElements
      });
    } catch (err) {
      setError(err.message || 'Unable to load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers(0, pagination.size);
  }, [id]);

  const handlePageChange = (_, value) => {
    loadSubscribers(value - 1, pagination.size);
  };

  return (
    <DashboardLayout role="PROVIDER" title="API subscribers" subtitle="View exact subscriber details for this API.">
      <PageHeader title="Subscribers" subtitle="Manage your current API subscribers." action={<Button component={Link} to={`/provider/apis/${id}`} variant="contained">Back to API</Button>} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}><AppCard title="Total subscribers" subtitle={pagination.totalElements} /></Grid>
        <Grid item xs={12} md={4}><AppCard title="Page" subtitle={pagination.page + 1} /></Grid>
        <Grid item xs={12} md={4}><AppCard title="Page size" subtitle={pagination.size} /></Grid>
      </Grid>
      <AppCard title="Subscriber list" subtitle="Exact user details for each active subscription.">
        {loading ? (
          <LoadingState title="Loading subscribers" description="Fetching subscriber details." />
        ) : error ? (
          <ErrorState message={error} retryLabel="Try again" onRetry={() => loadSubscribers(pagination.page, pagination.size)} />
        ) : subscribers.length === 0 ? (
          <EmptyState title="No subscribers yet" description="No active subscriptions have been recorded for this API." />
        ) : (
          <Stack spacing={2}>
            <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Price</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Expires</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribers.map((subscriber) => (
                    <TableRow key={subscriber.subscriptionId}>
                      <TableCell>{subscriber.consumerName || 'Unknown'}</TableCell>
                      <TableCell>{subscriber.consumerEmail || 'Unknown'}</TableCell>
                      <TableCell>{subscriber.plan?.name || 'Unknown'}</TableCell>
                      <TableCell>{subscriber.price != null ? formatCurrency(subscriber.price) : '—'}</TableCell>
                      <TableCell><Chip label={subscriber.status || 'Unknown'} size="small" /></TableCell>
                      <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                      <TableCell>{subscriber.expiresAt ? formatDate(subscriber.expiresAt) : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Pagination count={pagination.totalPages} page={pagination.page + 1} onChange={handlePageChange} color="primary" />
              </Box>
            )}
          </Stack>
        )}
      </AppCard>
    </DashboardLayout>
  );
};

export default ProviderApiSubscribersPage;
