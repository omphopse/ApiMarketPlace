import { useEffect, useMemo, useState } from 'react';
import { Alert, Box, Button, Card, Chip, Divider, Drawer, Grid, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
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

const AdminProvidersPage = () => {
  const navigate = useNavigate();
  const { providerId } = useParams();
  const [providers, setProviders] = useState([]);
  const [pending, setPending] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [detailError, setDetailError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'ALL' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [providerList, pendingList] = await Promise.all([
        adminService.getProviders(),
        adminService.getPendingProviders()
      ]);

      setProviders(providerList || []);
      setPending(pendingList || []);
    } catch (requestError) {
      setError(requestError.message || 'Unable to load providers.');
    } finally {
      setLoading(false);
    }
  };

  const loadProvider = async (id) => {
    if (!id) {
      setSelectedProvider(null);
      return;
    }

    try {
      setDetailLoading(true);
      setDetailError('');
      const result = await adminService.getProviderById(id);
      setSelectedProvider(result);
    } catch (requestError) {
      setDetailError(requestError.message || 'Unable to load provider details.');
      setSelectedProvider(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (providerId) {
      loadProvider(providerId);
    } else {
      setSelectedProvider(null);
      setDetailError('');
      setDetailLoading(false);
    }
  }, [providerId]);

  const pendingIds = useMemo(() => new Set(pending.map((provider) => provider.id)), [pending]);
  const activeProviders = useMemo(
    () => providers.filter((provider) => !pendingIds.has(provider.id)),
    [providers, pendingIds]
  );

  const visibleProviders = useMemo(() => {
    return activeProviders.filter((provider) => {
      if (filters.status !== 'ALL' && provider.status !== filters.status) {
        return false;
      }

      if (filters.search.trim()) {
        const query = filters.search.trim().toLowerCase();
        const name = String(provider.fullName || '').toLowerCase();
        const email = String(provider.email || '').toLowerCase();
        return name.includes(query) || email.includes(query);
      }

      return true;
    });
  }, [activeProviders, filters]);

  useEffect(() => {
    if (page > 0 && page * rowsPerPage >= visibleProviders.length) {
      setPage(0);
    }
  }, [visibleProviders, page, rowsPerPage]);

  const pagedProviders = useMemo(() => {
    const start = page * rowsPerPage;
    return visibleProviders.slice(start, start + rowsPerPage);
  }, [visibleProviders, page, rowsPerPage]);

  const summary = useMemo(() => ({
    total: activeProviders.length,
    pending: pending.length,
    active: activeProviders.filter((provider) => provider.status === 'ACTIVE').length,
    suspended: activeProviders.filter((provider) => provider.status === 'SUSPENDED').length
  }), [activeProviders, pending.length]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    setPage(0);
  };

  const openProvider = (provider) => {
    navigate(`/admin/providers/${provider.id}`);
  };

  const closeDrawer = () => {
    navigate('/admin/providers');
  };

  const updatePending = async (id, action) => {
    try {
      if (action === 'approve') await adminService.approveProvider(id);
      else await adminService.rejectProvider(id);
      if (id === providerId) {
        await loadProvider(id);
      }
      await load();
    } catch (requestError) {
      setError(requestError.message || 'Unable to update provider approval.');
    }
  };

  const selectedProviderIsPending = selectedProvider ? pendingIds.has(selectedProvider.id) : false;

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="Providers" subtitle="Manage provider accounts using backend-supported actions.">
        <LoadingState title="Loading providers" description="Fetching provider records from the backend." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="Providers" subtitle="Manage provider accounts using backend-supported actions.">
        <ErrorState message={error} retryLabel="Try again" onRetry={load} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="Providers" subtitle="Manage provider accounts using backend-supported actions.">
      <PageHeader
        title="Providers"
        subtitle="Search providers and open details within a single admin workspace."
        action={<Button variant="contained" onClick={load}>Refresh</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Active providers', value: summary.active },
          { label: 'Suspended providers', value: summary.suspended },
          { label: 'Pending approvals', value: summary.pending },
          { label: 'Provider directory', value: summary.total }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="h5" fontWeight={700}>{item.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <AppCard title="Provider directory" subtitle="Browse provider accounts and open details without leaving the page.">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <TextField
                label="Search providers"
                value={filters.search}
                onChange={handleFilterChange('search')}
                fullWidth
                size="small"
              />
              <TextField
                select
                label="Status"
                value={filters.status}
                onChange={handleFilterChange('status')}
                size="small"
                sx={{ minWidth: 180 }}
              >
                {['ALL', 'ACTIVE', 'SUSPENDED'].map((status) => (
                  <MenuItem key={status} value={status}>{status}</MenuItem>
                ))}
              </TextField>
            </Stack>

            {visibleProviders.length === 0 ? (
              <EmptyState title="No providers found" description="Try a different search or clear the status filter." />
            ) : (
              <Stack spacing={2}>
                {pagedProviders.map((provider) => (
                  <Card key={provider.id} sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{provider.fullName || provider.email}</Typography>
                        <Typography color="text.secondary">{provider.email}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip label={provider.role || 'PROVIDER'} size="small" />
                        <Chip label={provider.status || 'UNKNOWN'} size="small" />
                      </Stack>
                      <Box>
                        <Button size="small" variant="outlined" onClick={() => openProvider(provider)}>Details</Button>
                      </Box>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </AppCard>
        </Grid>

        <Grid item xs={12} lg={5}>
          <AppCard title="Pending approvals" subtitle="Approve or reject provider onboarding requests.">
            {pending.length === 0 ? (
              <Alert severity="info">No pending providers.</Alert>
            ) : (
              <Stack spacing={2}>
                {pending.map((provider) => (
                  <Card key={provider.id} sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack spacing={1}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>{provider.fullName || provider.email}</Typography>
                        <Typography color="text.secondary">{provider.email}</Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        <Chip label={provider.role || 'PROVIDER'} size="small" />
                        <Chip label="PENDING" color="warning" size="small" />
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                        <Button size="small" variant="contained" onClick={() => updatePending(provider.id, 'approve')}>Approve</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => updatePending(provider.id, 'reject')}>Reject</Button>
                        <Button size="small" variant="text" onClick={() => openProvider(provider)}>Details</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </AppCard>
        </Grid>
      </Grid>

      <Drawer
        anchor="right"
        open={Boolean(providerId)}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 560 }, maxWidth: '100%' } }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Provider details</Typography>
              <Typography color="text.secondary">{selectedProvider?.email || 'Provider information'}</Typography>
            </Box>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {detailLoading ? (
            <LoadingState title="Loading provider details" description="Fetching provider record." />
          ) : detailError ? (
            <ErrorState message={detailError} retryLabel="Try again" onRetry={() => loadProvider(providerId)} />
          ) : !selectedProvider ? (
            <Alert severity="warning">The requested provider could not be found.</Alert>
          ) : (
            <Stack spacing={3}>
              <AppCard title="Profile" subtitle="Basic provider account details.">
                <Stack spacing={1}>
                  <Typography><strong>Name:</strong> {selectedProvider.fullName || 'Unavailable'}</Typography>
                  <Typography><strong>Email:</strong> {selectedProvider.email || 'Unavailable'}</Typography>
                  <Typography><strong>Role:</strong> {selectedProvider.role || 'PROVIDER'}</Typography>
                  <Typography><strong>Status:</strong> {selectedProvider.status || 'UNKNOWN'}</Typography>
                  <Typography><strong>Id:</strong> {selectedProvider.id}</Typography>
                </Stack>
              </AppCard>

              <AppCard title="Current status" subtitle="Provider lifecycle state.">
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip label={selectedProvider.status || 'UNKNOWN'} color={selectedProvider.status === 'ACTIVE' ? 'success' : 'default'} />
                    <Chip label={`Role: ${selectedProvider.role || 'PROVIDER'}`} variant="outlined" />
                    {selectedProviderIsPending && <Chip label="PENDING APPROVAL" color="warning" />}
                  </Stack>
                  <Typography color="text.secondary">Data shown here is taken directly from the admin backend user record.</Typography>
                </Stack>
              </AppCard>

              {selectedProviderIsPending && (
                <AppCard title="Pending actions" subtitle="Approve or reject this provider.">
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Button variant="contained" onClick={() => updatePending(selectedProvider.id, 'approve')}>Approve</Button>
                    <Button variant="outlined" color="error" onClick={() => updatePending(selectedProvider.id, 'reject')}>Reject</Button>
                  </Stack>
                </AppCard>
              )}
            </Stack>
          )}
        </Box>
      </Drawer>
    </DashboardLayout>
  );
};

export default AdminProvidersPage;
