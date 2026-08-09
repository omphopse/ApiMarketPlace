import { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Chip, Drawer, FormControl, Grid, InputLabel, MenuItem, Pagination, Select, Stack, TextField, Typography, useMediaQuery, useTheme, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import ApiMarketplaceCard from '../components/ApiMarketplaceCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { consumerService } from '../services/consumerService';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { getStoredUser } from '../utils/auth';

const categories = ['All', 'AI', 'Finance', 'Crypto', 'Weather', 'Maps', 'Payments', 'Messaging', 'Developer Tools', 'Storage', 'Authentication', 'Education', 'Travel'];
const pricingOptions = ['All', 'Free', 'Paid'];
const sortOptions = [
  { value: 'POPULAR', label: 'Most Popular' },
  { value: 'NEWEST', label: 'Newest' },
  { value: 'NAME_ASC', label: 'Name A-Z' },
  { value: 'PRICE_ASC', label: 'Price Low to High' },
  { value: 'PRICE_DESC', label: 'Price High to Low' }
];

const MarketplacePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const searchRef = useRef(null);
  const [page, setPage] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    pricing: searchParams.get('pricing') || 'All',
    sort: searchParams.get('sort') || 'POPULAR',
    page: Number(searchParams.get('page') || 0)
  });
  const [pagination, setPagination] = useState({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 1, first: true, last: true });
  const user = getStoredUser();

  const loadMarketplace = async (nextFilters = filters) => {
    try {
      setLoading(true);
      const result = await consumerService.getMarketplaceApis({ ...nextFilters, page: Number(nextFilters.page || 0), size: 12 });
      setPagination(result);
      setApis(result.content);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load the marketplace.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketplace({ ...filters, page: 0 });
  }, []);

  // keyboard shortcut to focus search ('/')
  useEffect(() => {
    const handler = (e) => {
      if (e.key === '/' && document && document.activeElement && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        searchRef.current && searchRef.current.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.category && filters.category !== 'All') params.set('category', filters.category);
    if (filters.pricing && filters.pricing !== 'All') params.set('pricing', filters.pricing);
    if (filters.sort && filters.sort !== 'POPULAR') params.set('sort', filters.sort);
    params.set('page', String(filters.page));
    setSearchParams(params);
  }, [filters.search, filters.category, filters.pricing, filters.sort, filters.page]);

  const visibleCountLabel = useMemo(() => (pagination.totalElements === 1 ? '1 API' : `${pagination.totalElements} APIs`), [pagination.totalElements]);

  const applyFilters = (nextFilters = filters) => {
    setFilters({ ...nextFilters, page: 0 });
    loadMarketplace({ ...nextFilters, page: 0 });
  };

  const resetFilters = () => {
    const nextFilters = { search: '', category: 'All', pricing: 'All', sort: 'POPULAR', page: 0 };
    setFilters(nextFilters);
    loadMarketplace(nextFilters);
  };

  const renderFilters = (compact = false) => (
    <Stack spacing={2}>
      <TextField label="Search APIs" value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} fullWidth />
      <FormControl fullWidth>
        <InputLabel>Category</InputLabel>
        <Select value={filters.category} label="Category" onChange={(event) => setFilters((prev) => ({ ...prev, category: event.target.value }))}>
          {categories.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Pricing</InputLabel>
        <Select value={filters.pricing} label="Pricing" onChange={(event) => setFilters((prev) => ({ ...prev, pricing: event.target.value }))}>
          {pricingOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
        </Select>
      </FormControl>
      <FormControl fullWidth>
        <InputLabel>Sort</InputLabel>
        <Select value={filters.sort} label="Sort" onChange={(event) => setFilters((prev) => ({ ...prev, sort: event.target.value }))}>
          {sortOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
        </Select>
      </FormControl>
      <Stack direction={compact ? 'column' : 'row'} spacing={1}>
        <Button variant="contained" onClick={() => applyFilters({ ...filters, page: 0 })}>Apply</Button>
        <Button variant="outlined" onClick={resetFilters}>Clear</Button>
      </Stack>
    </Stack>
  );

  return (
    <DashboardLayout role="CONSUMER" title="Developer marketplace" subtitle="Discover APIs for your next integration.">
      <PageHeader title="Discover APIs" subtitle="Search, compare and subscribe to trusted APIs in one place." action={<Button variant="contained" onClick={() => navigate('/consumer/dashboard')}>Back to dashboard</Button>} />
      {/* Hero + Search */}
      <Box sx={{ mb: 3, px: 2 }}>
        <Box sx={{ maxWidth: 1200, mx: 'auto', py: 3 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" sx={{ fontSize: { xs: 26, md: 36 }, fontWeight: 800 }}>Build faster with APIs</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Discover production-ready APIs for your next application — connect secure subscriptions, manage keys, and ship faster.</Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button variant="contained" size="large" onClick={() => { if (searchRef.current) searchRef.current.focus(); }}>Explore APIs</Button>
                {user?.role === 'PROVIDER' && (
                  <Button variant="outlined" size="large" onClick={() => navigate('/provider/offer')}>Publish an API</Button>
                )}
              </Stack>
            </Box>
            <Box sx={{ width: 240, height: 120, borderRadius: 2, background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(99,102,241,0.03))', display: { xs: 'none', md: 'block' } }} aria-hidden>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Box sx={{ position: 'absolute', width: 110, height: 110, bgcolor: 'primary.main', opacity: 0.08, borderRadius: 2, transform: 'rotate(12deg)', top: -8, right: -20 }} />
                <Box sx={{ position: 'absolute', width: 80, height: 80, bgcolor: 'secondary.light', opacity: 0.04, borderRadius: '50%', bottom: -12, left: -12 }} />
              </Box>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              inputRef={searchRef}
              placeholder="Search APIs, payments, maps, AI... (press / to focus)"
              value={filters.search}
              onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
              onKeyDown={(e) => { if (e.key === 'Enter') applyFilters({ ...filters, page: 0 }); }}
              fullWidth
              size="large"
              variant="outlined"
              InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>), sx: { borderRadius: 2, boxShadow: '0 1px 2px rgba(16,24,40,0.04)' } }}
            />
            <Button variant="contained" size="large" onClick={() => applyFilters({ ...filters, page: 0 })}>Search</Button>
            {isMobile && <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setDrawerOpen(true)}>Filters</Button>}
          </Stack>

          <Stack direction="row" spacing={1} sx={{ mt: 2, overflowX: 'auto', py: 1 }}>
            <Button size="small" variant={filters.category === 'All' ? 'contained' : 'text'} onClick={() => applyFilters({ ...filters, category: 'All', page: 0 })}>All</Button>
            {categories.slice(1).map((category) => (
              <Button key={category} size="small" variant={filters.category === category ? 'contained' : 'text'} onClick={() => applyFilters({ ...filters, category, page: 0 })}>{category}</Button>
            ))}
          </Stack>
        </Box>
      </Box>
      <Grid container spacing={3}>
        {!isMobile && (
          <Grid item xs={12} md={3}>
            <AppCard title="Filters" subtitle="Narrow down the marketplace" sx={{ position: 'sticky', top: 24 }}>
              {renderFilters()}
            </AppCard>
          </Grid>
        )}
        <Grid item xs={12} md={9}>
          <AppCard title="Marketplace results" subtitle={`${visibleCountLabel} • showing results for your current search`} sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
              <Typography color="text.secondary">{filters.search ? `Showing APIs matching “${filters.search}”` : 'Browse the full marketplace catalog.'}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">Sort</Typography>
                <FormControl size="small">
                  <Select value={filters.sort} onChange={(event) => applyFilters({ ...filters, sort: event.target.value, page: 0 })}>
                    {sortOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </AppCard>
          {loading ? <LoadingState title="Loading marketplace" description="Preparing the best APIs for you." /> : error ? <ErrorState message={error} retryLabel="Try again" onRetry={() => loadMarketplace(filters)} /> : apis.length === 0 ? <EmptyState title="No APIs found" description="Try adjusting your search or filters." actionLabel="Clear filters" onClick={resetFilters} /> : <Grid container spacing={2}>{apis.map((api) => <Grid item xs={12} md={6} lg={4} key={api.id}><ApiMarketplaceCard api={api} /></Grid>)}</Grid>}
          {pagination.totalPages > 1 && (
            <Stack alignItems="center" sx={{ mt: 3 }}>
              <Pagination count={pagination.totalPages} page={filters.page} onChange={(_, nextPage) => {
                const nextFilters = { ...filters, page: nextPage - 1 };
                setFilters(nextFilters);
                loadMarketplace(nextFilters);
              }} color="primary" />
            </Stack>
          )}
        </Grid>
      </Grid>
      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 2, minHeight: 320 }}>
          <Typography fontWeight={700} sx={{ mb: 2 }}>Filters</Typography>
          {renderFilters(true)}
        </Box>
      </Drawer>
    </DashboardLayout>
  );
};

export default MarketplacePage;
