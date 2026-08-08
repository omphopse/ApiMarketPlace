import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { providerService } from '../services/providerService';
import { statusConfig, statusOptions, categoryOptions } from '../config/statusConfig';
import { formatCurrency, formatNumber } from '../utils/formatters';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';
import { toast } from 'react-toastify';
import ConfirmDialog from '../components/ConfirmDialog';

const ProviderApisPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ search: '', status: 'ALL', category: '', sort: 'NEWEST' });
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeApiId, setActiveApiId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const loadApis = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await providerService.getApis(filters);
      setApis(result);
    } catch (err) {
      setError(err.message || 'Unable to load APIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApis();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadApis();
    }, 250);
    return () => clearTimeout(timer);
  }, [filters.search, filters.status, filters.category, filters.sort]);

  const summaryCards = useMemo(() => [
    { label: 'All', value: apis.length, filter: 'ALL' },
    { label: 'Published', value: apis.filter((api) => api.status === 'APPROVED').length, filter: 'APPROVED' },
    { label: 'Pending', value: apis.filter((api) => api.status === 'PENDING').length, filter: 'PENDING' },
    { label: 'Draft', value: apis.filter((api) => api.status === 'DRAFT').length, filter: 'DRAFT' },
    { label: 'Rejected', value: apis.filter((api) => api.status === 'REJECTED').length, filter: 'REJECTED' },
    { label: 'Archived', value: apis.filter((api) => api.status === 'ARCHIVED').length, filter: 'ARCHIVED' }
  ], [apis]);

  const openMenu = (event, apiId) => {
    setAnchorEl(event.currentTarget);
    setActiveApiId(apiId);
  };

  const closeMenu = () => setAnchorEl(null);

  const handleAction = async (action) => {
    closeMenu();
    const api = apis.find((item) => item.id === activeApiId);
    if (!api) return;
    if (action === 'archive') {
      setConfirmAction({ type: 'archive', api });
      setConfirmOpen(true);
      return;
    }
    if (action === 'delete') {
      setConfirmAction({ type: 'delete', api });
      setConfirmOpen(true);
      return;
    }
    if (action === 'submit') {
      try {
        await providerService.submitApi(api.id);
        toast.success('API submitted for approval.');
        loadApis();
      } catch (err) {
        toast.error(err.message || 'Unable to submit API.');
      }
      return;
    }
    if (action === 'view') {
      window.location.assign(`/provider/apis/${api.id}`);
    }
  };

  const confirmActionHandler = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'archive') {
        await providerService.archiveApi(confirmAction.api.id);
        toast.success('API archived.');
      }
      if (confirmAction.type === 'delete') {
        await providerService.deleteApi(confirmAction.api.id);
        toast.success('API removed from your workspace.');
      }
      setConfirmOpen(false);
      loadApis();
    } catch (err) {
      toast.error(err.message || 'Unable to complete that action.');
    }
  };

  return (
    <DashboardLayout role="PROVIDER" title="Provider portal" subtitle="Create, publish and refine your APIs.">
      <PageHeader title="My APIs" subtitle="Create, publish and manage your APIs." action={<Button component={Link} to="/provider/apis/create" variant="contained">+ Create API</Button>} />
      <AppCard title="API overview" subtitle="Quick health snapshot">
        <Grid container spacing={2}>
          {summaryCards.map((card) => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Box onClick={() => setFilters((prev) => ({ ...prev, status: card.filter }))} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: filters.status === card.filter ? 'primary.main' : 'divider', bgcolor: filters.status === card.filter ? 'secondary.main' : 'background.paper', cursor: 'pointer' }}>
                <Typography variant="caption" color="text.secondary">{card.label}</Typography>
                <Typography variant="h6" fontWeight={700}>{card.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </AppCard>
      <AppCard title="Search and filters" subtitle="Find the right API quickly" sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField label="Search APIs" value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={filters.status} label="Status" onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
                {statusOptions.map((option) => <MenuItem key={option} value={option}>{option === 'ALL' ? 'All' : option}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select value={filters.category} label="Category" onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}>
                <MenuItem value="">All</MenuItem>
                {categoryOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Sort</InputLabel>
              <Select value={filters.sort} label="Sort" onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}>
                <MenuItem value="NEWEST">Newest</MenuItem>
                <MenuItem value="OLDEST">Oldest</MenuItem>
                <MenuItem value="NAME_ASC">Name A-Z</MenuItem>
                <MenuItem value="NAME_DESC">Name Z-A</MenuItem>
                <MenuItem value="MOST_REQUESTS">Most Requests</MenuItem>
                <MenuItem value="MOST_SUBSCRIBERS">Most Subscribers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </AppCard>
      <AppCard title="Your APIs" subtitle="Filter by status, category or search term" sx={{ mt: 3 }}>
        {loading ? <LoadingState title="Loading your APIs" description="Preparing your catalog and status details." /> : error ? <ErrorState message={error} retryLabel="Try again" onRetry={loadApis} /> : apis.length === 0 ? <EmptyState title="No APIs yet" description="Create your first API and start publishing on APIHub." actionLabel="Create API" actionTo="/provider/apis/create" /> : (isMobile ? (
          <Stack spacing={2}>
            {apis.map((api) => (
              <Box key={api.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography fontWeight={700}>{api.name}</Typography>
                  <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" />
                </Stack>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>{api.category} • {api.version}</Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="body2">Req: {formatNumber(api.requests)}</Typography>
                  <Typography variant="body2">Subs: {formatNumber(api.subscribers)}</Typography>
                </Stack>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button component={Link} to={`/provider/apis/${api.id}`} size="small" variant="outlined">View</Button>
                  <Button component={Link} to={`/provider/apis/${api.id}/edit`} size="small" variant="outlined">Edit</Button>
                  <IconButton size="small" onClick={(event) => openMenu(event, api.id)}><MoreVertIcon /></IconButton>
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>API</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Category</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Version</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Status</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Subscribers</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Requests</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Revenue</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Updated</th>
                  <th style={{ textAlign: 'left', paddingBottom: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {apis.map((api) => (
                  <tr key={api.id}>
                    <td style={{ padding: '12px 0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box component="img" src={api.logo} alt={api.name} sx={{ width: 36, height: 36, borderRadius: 12, objectFit: 'cover' }} />
                        <Box>
                          <Typography fontWeight={700}>{api.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{api.shortDescription}</Typography>
                        </Box>
                      </Box>
                    </td>
                    <td>{api.category}</td>
                    <td>{api.version}</td>
                    <td><Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" /></td>
                    <td>{formatNumber(api.subscribers)}</td>
                    <td>{formatNumber(api.requests)}</td>
                    <td>{formatCurrency(api.revenue)}</td>
                    <td>{new Date(api.lastUpdated).toLocaleDateString('en-IN')}</td>
                    <td>
                      <Stack direction="row" spacing={1}>
                        <Button component={Link} to={`/provider/apis/${api.id}`} size="small">View</Button>
                        <Button component={Link} to={`/provider/apis/${api.id}/edit`} size="small" variant="outlined">Edit</Button>
                        <IconButton size="small" onClick={(event) => openMenu(event, api.id)}><MoreVertIcon /></IconButton>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Box>
          </Box>
        ))}
      </AppCard>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MuiMenuItem component={Link} to={`/provider/apis/${activeApiId}`} onClick={closeMenu}>View</MuiMenuItem>
        <MuiMenuItem component={Link} to={`/provider/apis/${activeApiId}/edit`} onClick={closeMenu}>Edit</MuiMenuItem>
        <MuiMenuItem component={Link} to={`/provider/apis/${activeApiId}/documentation`} onClick={closeMenu}>Documentation</MuiMenuItem>
        <MuiMenuItem component={Link} to={`/provider/apis/${activeApiId}/plans`} onClick={closeMenu}>Manage Plans</MuiMenuItem>
        <MuiMenuItem onClick={() => handleAction('submit')}>Submit for Approval</MuiMenuItem>
        <MuiMenuItem onClick={() => handleAction('archive')}>Archive</MuiMenuItem>
        <MuiMenuItem onClick={() => handleAction('delete')}>Delete</MuiMenuItem>
      </Menu>
      <ConfirmDialog open={confirmOpen} title={confirmAction?.type === 'delete' ? 'Delete API?' : 'Archive this API?'} description={confirmAction?.type === 'delete' ? 'This action will remove the API from your provider workspace.' : 'Archived APIs stay accessible but are no longer active in the marketplace.'} confirmLabel={confirmAction?.type === 'delete' ? 'Delete API' : 'Archive API'} onClose={() => setConfirmOpen(false)} onConfirm={confirmActionHandler} />
    </DashboardLayout>
  );
};

export default ProviderApisPage;
