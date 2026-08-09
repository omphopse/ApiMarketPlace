import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Grid, MenuItem, Stack, TablePagination, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { adminService } from '../services/adminService';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: '', role: 'ALL', status: 'ALL' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const normalizeRole = (role) => String(role || '').replace(/^ROLE_/, '').toUpperCase();

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getUsers();
      setUsers(response || []);
    } catch (err) {
      setError(err.message || 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const visibleUsers = useMemo(() => users.filter((user) => {
    if (filters.role !== 'ALL' && normalizeRole(user.role) !== filters.role) return false;
    if (filters.status !== 'ALL' && user.status !== filters.status) return false;

    if (filters.search.trim()) {
      const query = filters.search.trim().toLowerCase();
      const name = String(user.fullName || '').toLowerCase();
      const email = String(user.email || '').toLowerCase();
      return name.includes(query) || email.includes(query);
    }

    return true;
  }), [users, filters]);

  const pagedUsers = useMemo(() => {
    const start = page * rowsPerPage;
    return visibleUsers.slice(start, start + rowsPerPage);
  }, [visibleUsers, page, rowsPerPage]);

  const summary = useMemo(() => ({
    total: visibleUsers.length,
    active: visibleUsers.filter((user) => user.status === 'ACTIVE').length,
    suspended: visibleUsers.filter((user) => user.status === 'SUSPENDED').length,
    admins: visibleUsers.filter((user) => normalizeRole(user.role) === 'ADMIN').length
  }), [visibleUsers]);

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="User administration" subtitle="Manage users and account health.">
        <LoadingState title="Loading users" description="Fetching the account list." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="User administration" subtitle="Manage users and account health.">
        <ErrorState message={error} retryLabel="Try again" onRetry={loadUsers} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="User administration" subtitle="Manage accounts, roles and access.">
      <PageHeader
        title="Users"
        subtitle="Oversee global account management and status."
        action={<Button variant="contained" onClick={loadUsers}>Refresh</Button>}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total users', value: summary.total },
          { label: 'Active', value: summary.active },
          { label: 'Suspended', value: summary.suspended },
          { label: 'Admins', value: summary.admins }
        ].map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="h5" fontWeight={700}>{item.value}</Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <AppCard title="User directory" subtitle="Browse, filter, and open user profiles.">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Search users"
            value={filters.search}
            onChange={handleFilterChange('search')}
            fullWidth
            size="small"
          />
          <TextField
            select
            label="Role"
            value={filters.role}
            onChange={handleFilterChange('role')}
            size="small"
            sx={{ minWidth: 180 }}
          >
            {['ALL', 'ADMIN', 'PROVIDER', 'CONSUMER'].map((role) => (
              <MenuItem key={role} value={role}>{role}</MenuItem>
            ))}
          </TextField>
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

        {visibleUsers.length === 0 ? (
          <EmptyState title="No users match filters" description="Try a broader search or clear one of the filters." />
        ) : isMobile ? (
          <Stack spacing={2}>
            {pagedUsers.map((user) => (
              <Card key={user.id} sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700}>{user.fullName || user.email}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{user.email}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mb: 2 }}>
                  <Chip label={normalizeRole(user.role)} size="small" />
                  <Chip label={user.status || 'UNKNOWN'} size="small" />
                </Stack>
                <Button size="small" variant="contained" onClick={() => navigate(`/admin/users/${user.id}`)}>View profile</Button>
              </Card>
            ))}
          </Stack>
        ) : (
          <>
            <Box sx={{ overflowX: 'auto' }}>
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                <Box component="thead">
                  <Box component="tr">
                    <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Name</Box>
                    <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Email</Box>
                    <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Role</Box>
                    <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Status</Box>
                    <Box component="th" sx={{ textAlign: 'left', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>Actions</Box>
                  </Box>
                </Box>
                <Box component="tbody">
                  {pagedUsers.map((user) => (
                    <Box component="tr" key={user.id}>
                      <Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{user.fullName || user.email}</Box>
                      <Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{user.email}</Box>
                      <Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{normalizeRole(user.role)}</Box>
                      <Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>{user.status || 'UNKNOWN'}</Box>
                      <Box component="td" sx={{ py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Button size="small" onClick={() => navigate(`/admin/users/${user.id}`)}>View</Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <TablePagination
              component="div"
              count={visibleUsers.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Rows per page"
              sx={{ mt: 2 }}
            />
          </>
        )}
      </AppCard>
    </DashboardLayout>
  );
};

export default AdminUsersPage;
