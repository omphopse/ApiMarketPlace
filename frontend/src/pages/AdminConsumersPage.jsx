import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Divider, Drawer, Grid, IconButton, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { adminService } from '../services/adminService';

const normalizeRole = (role) => String(role || '').replace(/^ROLE_/, '').toUpperCase();

const AdminConsumersPage = () => {
  const navigate = useNavigate();
  const { consumerId } = useParams();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [consumers, setConsumers] = useState([]);
  const [selectedConsumer, setSelectedConsumer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

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

  const loadConsumer = async (id) => {
    if (!id) {
      setSelectedConsumer(null);
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError('');
      const result = await adminService.getConsumerById(id);
      setSelectedConsumer(result);
    } catch (err) {
      setDetailError(err.message || 'Unable to load consumer details.');
      setSelectedConsumer(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    loadConsumers();
  }, []);

  useEffect(() => {
    if (consumerId) {
      loadConsumer(consumerId);
    } else {
      setSelectedConsumer(null);
      setDetailError('');
      setDetailLoading(false);
    }
  }, [consumerId]);

  const filteredConsumers = useMemo(() => {
    return consumers.filter((consumer) => {
      if (statusFilter !== 'ALL' && consumer.status !== statusFilter) {
        return false;
      }

      if (!search.trim()) {
        return true;
      }

      const query = search.trim().toLowerCase();
      const fullName = String(consumer.fullName || '').toLowerCase();
      const email = String(consumer.email || '').toLowerCase();
      const id = String(consumer.id || '').toLowerCase();
      return fullName.includes(query) || email.includes(query) || id.includes(query);
    });
  }, [consumers, search, statusFilter]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= filteredConsumers.length) {
      setPage(0);
    }
  }, [filteredConsumers.length, page, rowsPerPage]);

  const pagedConsumers = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredConsumers.slice(start, start + rowsPerPage);
  }, [filteredConsumers, page, rowsPerPage]);

  const summary = useMemo(() => ({
    total: consumers.length,
    active: consumers.filter((consumer) => consumer.status === 'ACTIVE').length,
    suspended: consumers.filter((consumer) => consumer.status === 'SUSPENDED').length
  }), [consumers]);

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
  };

  const openConsumer = (consumer) => {
    navigate(`/admin/consumers/${consumer.id}`);
  };

  const closeDrawer = () => {
    navigate('/admin/consumers');
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="Consumers" subtitle="Manage consumer accounts, subscriptions, and platform usage.">
        <LoadingState title="Loading consumers" description="Fetching consumer records." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="Consumers" subtitle="Manage consumer accounts, subscriptions, and platform usage.">
        <ErrorState message={error} retryLabel="Try again" onRetry={loadConsumers} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="Consumers" subtitle="Manage consumer accounts, subscriptions, and platform usage.">
      <PageHeader
        title="Consumers"
        subtitle="Manage consumer accounts, subscriptions, and platform usage."
        action={<Button variant="contained" onClick={loadConsumers}>Refresh</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total consumers', value: summary.total },
          { label: 'Active consumers', value: summary.active },
          { label: 'Suspended consumers', value: summary.suspended }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="h5" fontWeight={700}>{item.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AppCard title="Consumer directory" subtitle="Browse consumer accounts and open details without leaving the list.">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="Search consumers"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                size="small"
                sx={{ minWidth: 180 }}
              >
                {['ALL', 'ACTIVE', 'SUSPENDED'].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
              {(search.trim() || statusFilter !== 'ALL') && (
                <Button variant="outlined" onClick={handleClearFilters}>Clear filters</Button>
              )}
            </Stack>

            {filteredConsumers.length === 0 ? (
              <EmptyState title="No matching consumers" description="Try adjusting your search or filters." />
            ) : isMobile ? (
              <Stack spacing={2}>
                {pagedConsumers.map((consumer) => (
                  <Card key={consumer.id} sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle1" fontWeight={700}>{consumer.fullName || consumer.email}</Typography>
                      <Typography color="text.secondary">{consumer.email}</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={normalizeRole(consumer.role)} size="small" />
                        <Chip label={consumer.status || 'UNKNOWN'} size="small" />
                      </Stack>
                      <Button size="small" variant="contained" onClick={() => openConsumer(consumer)}>Details</Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Consumer</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedConsumers.map((consumer) => (
                      <TableRow key={consumer.id} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700}>{consumer.fullName || consumer.email}</Typography>
                            <Typography color="text.secondary" variant="body2">{consumer.id}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{consumer.email}</TableCell>
                        <TableCell>
                          <Chip label={consumer.status || 'UNKNOWN'} size="small" color={consumer.status === 'ACTIVE' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" onClick={() => openConsumer(consumer)}>Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AppCard>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={Boolean(consumerId)}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, maxWidth: '100%' } }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Consumer details</Typography>
              <Typography color="text.secondary">Review selected consumer profile and account status.</Typography>
            </Box>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {detailLoading ? (
            <LoadingState title="Loading consumer details" description="Fetching consumer account information." />
          ) : detailError ? (
            <ErrorState message={detailError} retryLabel="Try again" onRetry={() => loadConsumer(consumerId)} />
          ) : !selectedConsumer ? (
            <Box sx={{ mt: 2 }}><Typography color="text.secondary">No consumer details are available.</Typography></Box>
          ) : (
            <Stack spacing={3}>
              <AppCard title="Profile" subtitle="Consumer account information.">
                <Stack spacing={1}>
                  <Typography><strong>Name:</strong> {selectedConsumer.fullName || 'Unavailable'}</Typography>
                  <Typography><strong>Email:</strong> {selectedConsumer.email || 'Unavailable'}</Typography>
                  <Typography><strong>Role:</strong> {normalizeRole(selectedConsumer.role)}</Typography>
                  <Typography><strong>Status:</strong> {selectedConsumer.status || 'UNKNOWN'}</Typography>
                  <Typography><strong>User ID:</strong> {selectedConsumer.id}</Typography>
                </Stack>
              </AppCard>
            </Stack>
          )}
        </Box>
      </Drawer>
    </DashboardLayout>
  );
};

export default AdminConsumersPage;
