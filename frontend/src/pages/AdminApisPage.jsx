import { useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { adminService } from '../services/adminService';
import { statusConfig } from '../config/statusConfig';

const formatDate = (value) => {
  if (!value) return 'Unavailable';
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Unavailable';
  }
};

const getInitials = (name) => {
  if (!name) return 'A';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
};

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'nameAsc', label: 'Name A–Z' },
  { value: 'nameDesc', label: 'Name Z–A' },
  { value: 'status', label: 'Status' }
];

const AdminApisPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [apis, setApis] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [versionFilter, setVersionFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setError('');
      const response = await adminService.getApis();
      setApis(response.content || []);
      setPage(1);
    } catch (err) {
      setError(err.message || 'Unable to load APIs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const statusOptions = useMemo(() => {
    const statuses = new Set((apis || []).map((api) => api.status).filter(Boolean));
    return ['ALL', ...Array.from(statuses).sort()];
  }, [apis]);

  const categoryOptions = useMemo(() => {
    const categories = new Set((apis || []).map((api) => api.categoryName || api.category).filter(Boolean));
    return ['ALL', ...Array.from(categories).sort()];
  }, [apis]);

  const providerOptions = useMemo(() => {
    const providers = new Set((apis || []).map((api) => api.providerName || api.companyName).filter(Boolean));
    return ['ALL', ...Array.from(providers).sort()];
  }, [apis]);

  const versionOptions = useMemo(() => {
    const versions = new Set((apis || []).map((api) => api.version).filter(Boolean));
    return ['ALL', ...Array.from(versions).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))];
  }, [apis]);

  const filteredApis = useMemo(() => {
    if (!apis) return [];
    return apis
      .filter((api) => {
        const text = [api.name, api.description, api.shortDescription, api.categoryName, api.category, api.providerName, api.companyName, api.version, api.status]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        const matchesSearch = !search || text.includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || api.status === statusFilter;
        const matchesCategory = categoryFilter === 'ALL' || (api.categoryName || api.category) === categoryFilter;
        const providerName = api.providerName || api.companyName;
        const matchesProvider = providerFilter === 'ALL' || providerName === providerFilter;
        const matchesVersion = versionFilter === 'ALL' || api.version === versionFilter;
        return matchesSearch && matchesStatus && matchesCategory && matchesProvider && matchesVersion;
      })
      .sort((a, b) => {
        if (sortBy === 'nameAsc') return String(a.name || '').localeCompare(b.name || '');
        if (sortBy === 'nameDesc') return String(b.name || '').localeCompare(a.name || '');
        if (sortBy === 'oldest') return new Date(a.createdAt || a.updatedAt || 0) - new Date(b.createdAt || b.updatedAt || 0);
        if (sortBy === 'status') return String(a.status || '').localeCompare(b.status || '');
        return new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0);
      });
  }, [apis, search, statusFilter, categoryFilter, providerFilter, versionFilter, sortBy]);

  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredApis.length / pageSize));
  const visibleApis = filteredApis.slice((page - 1) * pageSize, page * pageSize);

  const countsByStatus = useMemo(() => {
    const counts = {};
    (apis || []).forEach((api) => {
      const status = api.status || 'UNKNOWN';
      counts[status] = (counts[status] || 0) + 1;
    });
    return counts;
  }, [apis]);

  const filterCount = [search, statusFilter !== 'ALL', categoryFilter !== 'ALL', providerFilter !== 'ALL', versionFilter !== 'ALL'].filter(Boolean).length;

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setCategoryFilter('ALL');
    setProviderFilter('ALL');
    setVersionFilter('ALL');
    setPage(1);
  };

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="APIs" subtitle="Manage and review APIs available across the APIHub marketplace.">
        <PageHeader title="API Catalog" subtitle="Manage and review APIs available across the APIHub marketplace." action={<Button variant="contained" onClick={load}>Refresh</Button>} />
        <ErrorState message={error} retryLabel="Try again" onRetry={load} />
      </DashboardLayout>
    );
  }

  if (loading || !apis) {
    return (
      <DashboardLayout role="ADMIN" title="APIs" subtitle="Manage and review APIs available across the APIHub marketplace.">
        <PageHeader title="API Catalog" subtitle="Manage and review APIs available across the APIHub marketplace." action={<Button variant="contained" onClick={load}>Refresh</Button>} />
        <LoadingState title="Loading APIs" description="Fetching marketplace API records from the backend." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="APIs" subtitle="Manage and review APIs available across the APIHub marketplace.">
      <PageHeader title="API Catalog" subtitle="Manage and review APIs available across the APIHub marketplace." action={<Button variant="contained" onClick={load}>Refresh</Button>} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total APIs</Typography>
            <Typography variant="h4" fontWeight={700}>{apis.length}</Typography>
            <Typography color="text.secondary">All marketplace records</Typography>
          </Card>
        </Grid>
        {Object.entries(countsByStatus).map(([status, count]) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Card variant="outlined" sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>{statusConfig[status]?.label || status}</Typography>
              <Typography variant="h4" fontWeight={700}>{count}</Typography>
              <Typography color="text.secondary">{statusConfig[status]?.description || 'Current status count'}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
          <TextField
            fullWidth
            size="small"
            label="Search APIs..."
            placeholder="Search APIs by name, description, provider, category, or version"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
          />
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option} value={option}>{option === 'ALL' ? 'All statuses' : statusConfig[option]?.label || option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Category</InputLabel>
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>{option === 'ALL' ? 'All categories' : option}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mt: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              label="Provider"
              value={providerFilter}
              onChange={(e) => { setProviderFilter(e.target.value); setPage(1); }}
            >
              {providerOptions.map((option) => (
                <MenuItem key={option} value={option}>{option === 'ALL' ? 'All providers' : option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Version</InputLabel>
            <Select
              label="Version"
              value={versionFilter}
              onChange={(e) => { setVersionFilter(e.target.value); setPage(1); }}
            >
              {versionOptions.map((option) => (
                <MenuItem key={option} value={option}>{option === 'ALL' ? 'All versions' : option}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Sort</InputLabel>
            <Select
              label="Sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {filterCount > 0 && (
            <Button variant="text" onClick={handleClearFilters} sx={{ ml: { md: 'auto' } }}>
              Clear filters{filterCount > 0 ? ` (${filterCount})` : ''}
            </Button>
          )}
        </Stack>
      </Card>

      {!filteredApis.length ? (
        <Box sx={{ py: 4 }}>
          <EmptyState
            title={search || filterCount ? 'No matching APIs' : 'No APIs available'}
            description={search || filterCount ? 'Try adjusting your search or filters.' : 'There are currently no API records available.'}
          />
          {filterCount > 0 && (
            <Button variant="contained" onClick={handleClearFilters}>
              Clear filters
            </Button>
          )}
        </Box>
      ) : (
        <>
          {isMobile ? (
            <Stack spacing={2}>
              {visibleApis.map((api) => {
                const providerName = api.providerName || api.companyName;
                const categoryName = api.categoryName || api.category;
                return (
                  <Card key={api.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={api.logo || undefined} alt={api.name} sx={{ width: 48, height: 48 }}>{!api.logo && getInitials(api.name)}</Avatar>
                        <Box>
                          <Typography fontWeight={700}>{api.name || 'Untitled API'}</Typography>
                          <Typography color="text.secondary" variant="body2">{categoryName || 'Category unavailable'}</Typography>
                        </Box>
                      </Stack>
                      <Typography color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {api.shortDescription || api.description || 'No description provided.'}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={providerName || 'Provider unavailable'} size="small" />
                        <Chip label={api.version ? `v${api.version}` : 'Version unavailable'} size="small" />
                        <Chip label={statusConfig[api.status]?.label || api.status || 'Unknown'} color={statusConfig[api.status]?.color || 'default'} size="small" />
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography color="text.secondary" variant="body2">Created {formatDate(api.createdAt)}</Typography>
                        <Button size="small" variant="contained" onClick={() => navigate(`/admin/apis/${api.id}`)}>View</Button>
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Stack>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>API</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Version</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleApis.map((api) => {
                    const providerName = api.providerName || api.companyName || 'Unavailable';
                    const categoryName = api.categoryName || api.category || 'Unavailable';
                    const description = api.shortDescription || api.description || 'No description provided.';
                    return (
                      <TableRow key={api.id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar src={api.logo || undefined} alt={api.name} sx={{ width: 44, height: 44 }}>{!api.logo && getInitials(api.name)}</Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={700} noWrap>{api.name || 'Untitled API'}</Typography>
                              <Tooltip title={description}>
                                <Typography variant="body2" color="text.secondary" noWrap>{description}</Typography>
                              </Tooltip>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{providerName}</TableCell>
                        <TableCell>{categoryName}</TableCell>
                        <TableCell>{api.version || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={statusConfig[api.status]?.label || api.status || 'Unknown'}
                            color={statusConfig[api.status]?.color || 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(api.createdAt || api.updatedAt)}</TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="contained" onClick={() => navigate(`/admin/apis/${api.id}`)}>View</Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" spacing={2}>
            <Typography color="text.secondary">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredApis.length)} of {filteredApis.length}
            </Typography>
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
              shape="rounded"
              size="small"
            />
          </Stack>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminApisPage;
