import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Drawer, FormControl, Grid, InputLabel, MenuItem, Pagination, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
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
      <AppCard title="Marketplace overview" subtitle="A polished discovery workspace for developer teams." sx={{ mb: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={700}>Discover APIs built for your next project.</Typography>
          <Typography color="text.secondary">Explore reliable APIs across AI, finance, payments, maps and more with mock subscriptions that feel production-ready.</Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
            <TextField label="Search APIs" value={filters.search} onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))} fullWidth />
            <Button variant="contained" onClick={() => applyFilters({ ...filters, page: 0 })}>Search</Button>
            {isMobile && <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setDrawerOpen(true)}>Filters</Button>}
          </Stack>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {categories.slice(1).map((category) => (
              <Chip key={category} label={category} color={filters.category === category ? 'primary' : 'default'} variant={filters.category === category ? 'filled' : 'outlined'} onClick={() => applyFilters({ ...filters, category, page: 0 })} />
            ))}
          </Stack>
        </Stack>
      </AppCard>
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
