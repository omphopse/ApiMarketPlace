import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Chip, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
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

  // helper avatar that falls back to initials when image is invalid
  const ImageAvatar = ({ src, name, sx }) => {
    const [failed, setFailed] = useState(false);
    const initials = (name || '').split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();
    if (!src || failed) return <Avatar sx={sx}>{initials || '?'}</Avatar>;
    return <Avatar src={src} sx={sx} imgProps={{ onError: () => setFailed(true) }}>{initials}</Avatar>;
  };

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
      <AppCard title="API overview" subtitle="Quick health snapshot" sx={{ pb: 1 }}>
        <Grid container spacing={2}>
          {summaryCards.map((card) => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Box onClick={() => setFilters((prev) => ({ ...prev, status: card.filter }))} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: filters.status === card.filter ? 'primary.main' : 'divider', bgcolor: filters.status === card.filter ? 'action.hover' : 'background.paper', cursor: 'pointer' }}>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{card.label}</Typography>
                <Typography variant="h6" fontWeight={700}>{card.value}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </AppCard>

      <AppCard sx={{ mt: 2, p: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems="center" sx={{ px: 1 }}> 
          <TextField
            placeholder="Search APIs..."
            size="small"
            fullWidth
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            InputProps={{ startAdornment: <InputAdornment position="start">🔍</InputAdornment> }}
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select value={filters.status} label="Status" onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
              {statusOptions.map((option) => <MenuItem key={option} value={option}>{option === 'ALL' ? 'All' : option}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select value={filters.category} label="Category" onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}>
              <MenuItem value="">All</MenuItem>
              {categoryOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
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
        </Stack>
      </AppCard>
      <AppCard title="Your APIs" subtitle="Filter by status, category or search term" sx={{ mt: 2 }}>
        {loading ? (
          <LoadingState title="Loading your APIs" description="Preparing your catalog and status details." />
        ) : error ? (
          <ErrorState message={error} retryLabel="Try again" onRetry={loadApis} />
        ) : apis.length === 0 ? (
          <EmptyState title="No APIs yet" description="Create your first API and start publishing on APIHub." actionLabel="Create API" actionTo="/provider/apis/create" />
        ) : (
          isMobile ? (
            <Stack spacing={1}>
              {apis.map((api) => (
                <Box key={api.id} sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ImageAvatar src={api.logo} name={api.name} sx={{ width: 44, height: 44 }} />
                      <Box>
                        <Typography fontWeight={700}>{api.name}</Typography>
                        <Typography variant="body2" color="text.secondary">{api.shortDescription || ''}</Typography>
                        <Typography variant="caption" color="text.secondary">{api.categoryName || api.category} · {api.version || '-'}</Typography>
                      </Box>
                    </Stack>
                    <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" />
                  </Stack>

                  <Stack direction="row" spacing={1} justifyContent="space-between" sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1}>
                      {api.subscribers != null && <Typography variant="caption" color="text.secondary">{formatNumber(api.subscribers)} subscribers</Typography>}
                      {api.revenue != null && <Typography variant="caption" color="text.secondary">{formatCurrency(api.revenue)}</Typography>}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button component={Link} to={`/provider/apis/${api.id}`} size="small">View</Button>
                      <Button component={Link} to={`/provider/apis/${api.id}/edit`} size="small" variant="outlined">Edit</Button>
                      <IconButton size="small" onClick={(event) => openMenu(event, api.id)}><MoreVertIcon /></IconButton>
                    </Stack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            // Desktop table with only present columns
            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow>
                    <TableCell>API</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Status</TableCell>
                    {apis.some(a => a.subscribers != null) && <TableCell align="right">Subscribers</TableCell>}
                    {apis.some(a => a.requests != null) && <TableCell align="right">Requests</TableCell>}
                    {apis.some(a => a.revenue != null) && <TableCell align="right">Revenue</TableCell>}
                    {apis.some(a => a.lastUpdated != null) && <TableCell>Updated</TableCell>}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apis.map((api) => (
                    <TableRow key={api.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <ImageAvatar src={api.logo} name={api.name} sx={{ width: 44, height: 44 }} />
                          <Box>
                            <Typography fontWeight={700}>{api.name}</Typography>
                            <Typography variant="body2" color="text.secondary">{api.shortDescription || ''}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>{api.categoryName || api.category || '-'}</TableCell>
                      <TableCell>{api.version || '-'}</TableCell>
                      <TableCell><Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} size="small" /></TableCell>
                      {apis.some(a => a.subscribers != null) && <TableCell align="right">{api.subscribers != null ? formatNumber(api.subscribers) : '-'}</TableCell>}
                      {apis.some(a => a.requests != null) && <TableCell align="right">{api.requests != null ? formatNumber(api.requests) : '-'}</TableCell>}
                      {apis.some(a => a.revenue != null) && <TableCell align="right">{api.revenue != null ? formatCurrency(api.revenue) : '-'}</TableCell>}
                      {apis.some(a => a.lastUpdated != null) && <TableCell>{api.lastUpdated ? new Date(api.lastUpdated).toLocaleDateString('en-IN') : '-'}</TableCell>}
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button component={Link} to={`/provider/apis/${api.id}`} size="small">View</Button>
                          <Button component={Link} to={`/provider/apis/${api.id}/edit`} size="small" variant="outlined">Edit</Button>
                          <IconButton size="small" onClick={(event) => openMenu(event, api.id)}><MoreVertIcon /></IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )
        )}
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
