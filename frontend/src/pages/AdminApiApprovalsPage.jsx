import { useEffect, useMemo, useState } from 'react';
import { Autocomplete, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Grid, IconButton, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';
import { statusConfig } from '../config/statusConfig';
import { formatDate, formatNumber, formatRelativeTime } from '../utils/formatters';

const extractUnique = (items, accessor) => Array.from(new Set(items.map(accessor).filter(Boolean))).sort();

const getDisplayProvider = (api) => api.providerName || api.companyName || 'Provider unavailable';

const AdminApiApprovalsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [apis, setApis] = useState([]);
  const [filters, setFilters] = useState({ search: '', status: 'PENDING', category: '', provider: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const loadApis = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getApis();
      setApis(response.content || []);
    } catch (err) {
      setError(err.message || 'Unable to load API submissions.');
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    try {
      setActivityError('');
      setActivityLoading(true);
      const logs = await adminService.getAuditLogs();
      setActivities(logs || []);
    } catch (err) {
      setActivityError(err.message || 'Unable to load approval activity.');
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    loadApis();
    loadActivities();
  }, []);

  const statusOptions = useMemo(() => ['ALL', ...extractUnique(apis, (api) => api.status)], [apis]);
  const categoryOptions = useMemo(() => extractUnique(apis, (api) => api.categoryName), [apis]);
  const providerOptions = useMemo(() => extractUnique(apis, getDisplayProvider), [apis]);

  const filteredApis = useMemo(() => {
    return apis.filter((api) => {
      const searchTerm = filters.search.trim().toLowerCase();
      if (filters.status && filters.status !== 'ALL' && api.status !== filters.status) return false;
      if (filters.category && api.categoryName?.toLowerCase().indexOf(filters.category.toLowerCase()) === -1) return false;
      if (filters.provider && getDisplayProvider(api).toLowerCase().indexOf(filters.provider.toLowerCase()) === -1) return false;
      if (!searchTerm) return true;
      const source = [api.name, api.shortDescription, api.description, api.categoryName, api.providerName, api.companyName].filter(Boolean).join(' ').toLowerCase();
      return source.includes(searchTerm);
    });
  }, [apis, filters]);

  const summary = useMemo(() => {
    const totals = { pending: 0, approved: 0, rejected: 0, draft: 0, archived: 0 };
    apis.forEach((api) => {
      if (api.status === 'PENDING') totals.pending += 1;
      if (api.status === 'APPROVED') totals.approved += 1;
      if (api.status === 'REJECTED') totals.rejected += 1;
      if (api.status === 'DRAFT') totals.draft += 1;
      if (api.status === 'ARCHIVED') totals.archived += 1;
    });
    return { total: apis.length, ...totals };
  }, [apis]);

  const statusDistribution = useMemo(() => {
    const map = new Map();
    apis.forEach((api) => {
      const status = api.status || 'UNKNOWN';
      map.set(status, (map.get(status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([status, value]) => ({ status, name: statusConfig[status]?.label || status, value }));
  }, [apis]);

  const refresh = async () => {
    await Promise.all([loadApis(), loadActivities()]);
  };

  const clearFilters = () => setFilters({ search: '', status: 'PENDING', category: '', provider: '' });

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="API approvals" subtitle="Review API submissions before they become available in the marketplace.">
        <PageHeader
          title="API Approvals"
          subtitle="Review API submissions before they are published to the marketplace."
          action={<Button startIcon={<RefreshIcon />} variant="contained" disabled>Refreshing...</Button>}
        />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ p: 3, borderRadius: 3, minHeight: 110, bgcolor: 'action.hover' }} />
            </Grid>
          ))}
        </Grid>
        <AppCard title="Approval queue" subtitle="Search, filter and review submissions.">
          <Stack spacing={2}>
            {[...Array(4)].map((_, index) => (
              <Card key={index} sx={{ p: 2.5, borderRadius: 3, bgcolor: 'action.hover' }}>
                <Box sx={{ height: 16, bgcolor: 'background.paper', borderRadius: 1, mb: 1.5 }} />
                <Box sx={{ height: 12, bgcolor: 'background.paper', borderRadius: 1, width: '80%', mb: 1.5 }} />
                <Box sx={{ height: 12, bgcolor: 'background.paper', borderRadius: 1, width: '50%' }} />
              </Card>
            ))}
          </Stack>
        </AppCard>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="API approvals" subtitle="Review API submissions before they become available in the marketplace.">
        <PageHeader
          title="API Approvals"
          subtitle="Review API submissions before they are published to the marketplace."
          action={<Button startIcon={<RefreshIcon />} variant="contained" onClick={refresh}>Refresh</Button>}
        />
        <ErrorState message={error} retryLabel="Try again" onRetry={refresh} />
      </DashboardLayout>
    );
  }

  const cards = [
    { label: 'Pending review', value: summary.pending, description: 'Awaiting administrator action', color: 'warning' },
    { label: 'Approved', value: summary.approved, description: 'Marketplace-ready APIs', color: 'success' },
    { label: 'Rejected', value: summary.rejected, description: 'Requires provider updates', color: 'error' },
    { label: 'Total submissions', value: summary.total, description: 'All stored API submissions', color: 'info' }
  ];

  return (
    <DashboardLayout role="ADMIN" title="API approvals" subtitle="Review API submissions before they become available in the marketplace.">
      <PageHeader
        title="API Approvals"
        subtitle="Review API submissions before they are published to the marketplace."
        action={(
          <Stack direction="row" spacing={1}>
            <Button startIcon={<RefreshIcon />} variant="contained" onClick={refresh}>Refresh</Button>
            {isMobile && <Button startIcon={<FilterListIcon />} variant="outlined" onClick={() => setFilterDialogOpen(true)}>Filters</Button>}
          </Stack>
        )}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 1, bgcolor: 'background.paper' }}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.12em' }}>{item.label}</Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>{formatNumber(item.value)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{item.description}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AppCard title="Approval queue" subtitle="Search and filter the latest API submissions.">
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <TextField
                label="Search APIs..."
                value={filters.search}
                onChange={(event) => setFilters({ ...filters, search: event.target.value })}
                fullWidth
                size="small"
              />
              {!isMobile && (
                <TextField
                  select
                  label="Status"
                  value={filters.status}
                  onChange={(event) => setFilters({ ...filters, status: event.target.value })}
                  size="small"
                  sx={{ minWidth: 170 }}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              )}
              {!isMobile && (
                <Autocomplete
                  freeSolo
                  options={categoryOptions}
                  value={filters.category}
                  onChange={(_, value) => setFilters({ ...filters, category: value || '' })}
                  onInputChange={(_, value) => setFilters({ ...filters, category: value })}
                  renderInput={(params) => <TextField {...params} label="Category" size="small" />}
                  sx={{ minWidth: 180, flex: 1 }}
                />
              )}
              {!isMobile && (
                <Autocomplete
                  freeSolo
                  options={providerOptions}
                  value={filters.provider}
                  onChange={(_, value) => setFilters({ ...filters, provider: value || '' })}
                  onInputChange={(_, value) => setFilters({ ...filters, provider: value })}
                  renderInput={(params) => <TextField {...params} label="Provider" size="small" />}
                  sx={{ minWidth: 180, flex: 1 }}
                />
              )}
              <Button variant="outlined" onClick={clearFilters} sx={{ height: 40 }}>Clear filters</Button>
            </Stack>

            {filteredApis.length === 0 ? (
              <EmptyState
                title="No APIs found"
                description={filters.search || filters.status !== 'ALL' || filters.category || filters.provider ? 'Try a different search term or clear your filters.' : 'There are no API submissions matching the current criteria.'}
              />
            ) : isMobile ? (
              <Stack spacing={2}>
                {filteredApis.map((api) => (
                  <Card key={api.id} sx={{ p: 2.5, borderRadius: 3 }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography fontWeight={700}>{api.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{api.shortDescription || api.description || 'No description available.'}</Typography>
                        </Box>
                        <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" />
                      </Stack>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={api.categoryName || 'Uncategorized'} size="small" />
                        <Chip label={getDisplayProvider(api)} size="small" />
                        <Chip label={api.version ? `v${api.version}` : 'Version unavailable'} size="small" />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Submitted {formatRelativeTime(api.createdAt)}</Typography>
                        <Button size="small" variant="contained" onClick={() => navigate(`/admin/api-approvals/${api.id}`)}>Review</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <Box component="thead">
                    <Box component="tr">
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>API</Box>
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Provider</Box>
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Category</Box>
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Submitted</Box>
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Plans</Box>
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Status</Box>
                      <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Action</Box>
                    </Box>
                  </Box>
                  <Box component="tbody">
                    {filteredApis.map((api) => (
                      <Box component="tr" key={api.id}>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider', minWidth: 260 }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            {api.logo ? (
                              <Box component="img" src={api.logo} alt={api.name} sx={{ width: 48, height: 48, borderRadius: 2, objectFit: 'cover' }} />
                            ) : (
                              <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'action.hover', display: 'grid', placeItems: 'center', color: 'text.secondary' }}>{api.name?.charAt(0) || '?'}</Box>
                            )}
                            <Box>
                              <Typography fontWeight={700}>{api.name}</Typography>
                              <Typography variant="body2" color="text.secondary">{api.shortDescription || api.description || 'No description available.'}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{getDisplayProvider(api)}</Box>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{api.categoryName || 'Uncategorized'}</Box>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{formatDate(api.createdAt)}</Box>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>{api.plans?.length || 0}</Box>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" /></Box>
                        <Box component="td" sx={{ py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}><Button size="small" variant="contained" onClick={() => navigate(`/admin/api-approvals/${api.id}`)}>Review</Button></Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
          </AppCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <AppCard title="Submission distribution" subtitle="Status distribution for all API submissions.">
            {statusDistribution.length ? (
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                      {statusDistribution.map((entry) => (
                        <Cell key={entry.status} fill={statusConfig[entry.status]?.color === 'warning' ? '#F59E0B' : statusConfig[entry.status]?.color === 'success' ? '#10B981' : statusConfig[entry.status]?.color === 'error' ? '#EF4444' : '#6366F1'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNumber(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Typography color="text.secondary">Not enough data yet to render status distribution.</Typography>
            )}
          </AppCard>

          <AppCard title="Recent approval activity" subtitle="Audit log entries returned by the backend." sx={{ mt: 3 }}>
            {activityLoading ? (
              <Stack spacing={2}>
                {[...Array(3)].map((_, index) => (
                  <Box key={index} sx={{ width: '100%', height: 72, bgcolor: 'action.hover', borderRadius: 2 }} />
                ))}
              </Stack>
            ) : activityError ? (
              <Typography color="error">{activityError}</Typography>
            ) : activities.length === 0 ? (
              <Typography color="text.secondary">No activity records were returned by the audit log endpoint.</Typography>
            ) : (
              <Stack spacing={2}>
                {activities.slice(0, 5).map((entry) => (
                  <Card key={entry.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                    <Typography fontWeight={700}>{entry.action || 'Action unavailable'}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{entry.description || 'No description provided.'}</Typography>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                      <Typography variant="caption" color="text.secondary">{entry.adminEmail || 'Unknown admin'}</Typography>
                      <Typography variant="caption" color="text.secondary">{formatRelativeTime(entry.createdAt)}</Typography>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </AppCard>
        </Grid>
      </Grid>

      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} fullWidth>
        <DialogTitle>Filters</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Status"
              select
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
              fullWidth
              size="small"
            >
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
            <Autocomplete
              freeSolo
              options={categoryOptions}
              value={filters.category}
              onChange={(_, value) => setFilters({ ...filters, category: value || '' })}
              onInputChange={(_, value) => setFilters({ ...filters, category: value })}
              renderInput={(params) => <TextField {...params} label="Category" size="small" fullWidth />}
            />
            <Autocomplete
              freeSolo
              options={providerOptions}
              value={filters.provider}
              onChange={(_, value) => setFilters({ ...filters, provider: value || '' })}
              onInputChange={(_, value) => setFilters({ ...filters, provider: value })}
              renderInput={(params) => <TextField {...params} label="Provider" size="small" fullWidth />}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>Apply</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminApiApprovalsPage;
