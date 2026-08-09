import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Divider, Drawer, Grid, IconButton, InputAdornment, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Skeleton, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { adminService } from '../services/adminService';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';

const ACTION_COLOR_MAP = [
  { pattern: /^APPROVE_/, color: 'success' },
  { pattern: /^ENABLE_/, color: 'success' },
  { pattern: /^CREATE_/, color: 'info' },
  { pattern: /^UPDATE_/, color: 'info' },
  { pattern: /^REJECT_/, color: 'error' },
  { pattern: /^DISABLE_/, color: 'warning' },
  { pattern: /^DELETE_/, color: 'error' },
  { pattern: /^LOGIN_/, color: 'default' }
];

const getActionBadgeColor = (action = '') => {
  const match = ACTION_COLOR_MAP.find((entry) => entry.pattern.test(action));
  return match ? match.color : 'default';
};

const dateFilters = [
  { value: 'all', label: 'All time' },
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' }
];

const AuditLogsLoadingTable = ({ rows = 6 }) => (
  <TableContainer component={Paper} variant="outlined">
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Action</TableCell>
          <TableCell>Actor</TableCell>
          <TableCell>Module</TableCell>
          <TableCell>Time</TableCell>
          <TableCell />
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, index) => (
          <TableRow key={index}>
            <TableCell><Skeleton width="60%" /></TableCell>
            <TableCell><Skeleton width="60%" /></TableCell>
            <TableCell><Skeleton width="50%" /></TableCell>
            <TableCell><Skeleton width="40%" /></TableCell>
            <TableCell><Skeleton width="30%" /></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const AdminAuditLogsPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [logs, setLogs] = useState(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [actorFilter, setActorFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedLog, setSelectedLog] = useState(null);

  const loadLogs = async () => {
    try {
      setError('');
      setLogs(await adminService.getAuditLogs());
    } catch (requestError) {
      setError(requestError.message || 'Unable to load audit logs.');
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const normalizedLogs = useMemo(() => Array.isArray(logs) ? logs : [], [logs]);

  const actions = useMemo(() => [...new Set(normalizedLogs.map((log) => log.action).filter(Boolean))].sort(), [normalizedLogs]);
  const modules = useMemo(() => [...new Set(normalizedLogs.map((log) => log.module).filter(Boolean))].sort(), [normalizedLogs]);
  const actors = useMemo(() => [...new Set(normalizedLogs.map((log) => log.adminEmail).filter(Boolean))].sort(), [normalizedLogs]);

  const filteredLogs = useMemo(() => {
    const now = new Date();
    return normalizedLogs
      .filter((log) => {
        if (actionFilter !== 'all' && log.action !== actionFilter) return false;
        if (moduleFilter !== 'all' && log.module !== moduleFilter) return false;
        if (actorFilter !== 'all' && log.adminEmail !== actorFilter) return false;

        if (dateFilter !== 'all' && log.createdAt) {
          const created = new Date(log.createdAt);
          if (!created || Number.isNaN(created.getTime())) return false;
          const diffMs = now - created;
          const oneDay = 24 * 60 * 60 * 1000;
          if (dateFilter === 'today' && created.toDateString() !== now.toDateString()) return false;
          if (dateFilter === '7days' && diffMs > 7 * oneDay) return false;
          if (dateFilter === '30days' && diffMs > 30 * oneDay) return false;
        }

        if (!search.trim()) return true;
        const keyword = search.trim().toLowerCase();
        return [log.action, log.module, log.adminEmail, log.description]
          .filter(Boolean)
          .some((value) => value.toString().toLowerCase().includes(keyword));
      })
      .sort((a, b) => {
        if (sortOrder === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortOrder === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        return 0;
      });
  }, [normalizedLogs, actionFilter, moduleFilter, actorFilter, dateFilter, search, sortOrder]);

  const activeFilters = [actionFilter, moduleFilter, actorFilter, dateFilter, search].some((value) => value && value !== 'all');

  const openDrawer = (log) => setSelectedLog(log);
  const closeDrawer = () => setSelectedLog(null);

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="Audit logs">
        <ErrorState message={error} retryLabel="Try again" onRetry={loadLogs} />
      </DashboardLayout>
    );
  }

  if (!logs) {
    return (
      <DashboardLayout role="ADMIN" title="Audit logs" subtitle="Review administrative activity across the marketplace.">
        <PageHeader title="Audit logs" subtitle="Review administrative activity across the marketplace." />
        <Box sx={{ mt: 3 }}>
          <AuditLogsLoadingTable />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="Audit logs" subtitle="Review administrative activity across the marketplace.">
      <PageHeader
        title="Audit logs"
        subtitle="Review administrative activity across the marketplace."
        action={
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadLogs}>
            Refresh
          </Button>
        }
      />

      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Total events</Typography>
            <Typography variant="h5" fontWeight={700}>{normalizedLogs.length}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Unique actions</Typography>
            <Typography variant="h5" fontWeight={700}>{actions.length}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Unique actors</Typography>
            <Typography variant="h5" fontWeight={700}>{actors.length}</Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" color="text.secondary">Showing</Typography>
            <Typography variant="h5" fontWeight={700}>{filteredLogs.length} / {normalizedLogs.length}</Typography>
          </Grid>
        </Grid>
      </Card>

      <Card variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search audit logs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Select
              fullWidth
              size="small"
              value={actionFilter}
              onChange={(event) => setActionFilter(event.target.value)}
            >
              <MenuItem value="all">Action: All</MenuItem>
              {actions.map((action) => (
                <MenuItem key={action} value={action}>{action}</MenuItem>
              ))}
            </Select>
          </Grid>
          {modules.length > 0 && (
            <Grid item xs={12} sm={6} md={2}>
              <Select
                fullWidth
                size="small"
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
              >
                <MenuItem value="all">Module: All</MenuItem>
                {modules.map((module) => (
                  <MenuItem key={module} value={module}>{module}</MenuItem>
                ))}
              </Select>
            </Grid>
          )}
          {actors.length > 0 && (
            <Grid item xs={12} sm={6} md={2}>
              <Select
                fullWidth
                size="small"
                value={actorFilter}
                onChange={(event) => setActorFilter(event.target.value)}
              >
                <MenuItem value="all">Actor: All</MenuItem>
                {actors.map((actor) => (
                  <MenuItem key={actor} value={actor}>{actor}</MenuItem>
                ))}
              </Select>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={2}>
            <Select
              fullWidth
              size="small"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
            >
              {dateFilters.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button
              fullWidth
              size="small"
              variant={activeFilters ? 'outlined' : 'text'}
              startIcon={<ClearIcon />}
              onClick={() => {
                setSearch('');
                setActionFilter('all');
                setModuleFilter('all');
                setActorFilter('all');
                setDateFilter('all');
              }}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Card>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        {filteredLogs.length === 0 ? (
          <Box sx={{ p: 4 }}>
            <EmptyState
              title={search.trim() || activeFilters ? 'No matching activity' : 'No activity recorded'}
              description={search.trim() || activeFilters ? 'Try changing your search or filters.' : 'Administrative actions will appear here when they occur.'}
            />
          </Box>
        ) : isMobile ? (
          <Stack spacing={2} sx={{ p: 2 }}>
            {filteredLogs.map((log) => (
              <Paper key={log.id} variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Chip
                        size="small"
                        label={log.action || 'UNKNOWN_ACTION'}
                        color={getActionBadgeColor(log.action)}
                        variant="outlined"
                      />
                    </Box>
                    <IconButton size="small" onClick={() => openDrawer(log)} aria-label="Inspect audit log">
                      <CloseIcon sx={{ transform: 'rotate(45deg)' }} />
                    </IconButton>
                  </Stack>
                  <Typography fontWeight={700}>{log.adminEmail || 'Unknown actor'}</Typography>
                  {log.module && <Typography color="text.secondary" variant="body2">Module: {log.module}</Typography>}
                  {log.description && <Typography color="text.secondary" variant="body2">{log.description}</Typography>}
                  <Typography variant="body2" color="text.secondary">
                    {formatRelativeTime(log.createdAt)} • {formatDateTime(log.createdAt)}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Action</TableCell>
                  <TableCell>Actor</TableCell>
                  <TableCell>Module</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Stack spacing={1}>
                        <Chip
                          size="small"
                          label={log.action || 'UNKNOWN_ACTION'}
                          color={getActionBadgeColor(log.action)}
                          variant="outlined"
                        />
                        {log.description && (
                          <Typography color="text.secondary" variant="body2">{log.description}</Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{log.adminEmail || 'Unavailable'}</TableCell>
                    <TableCell>{log.module || 'Unavailable'}</TableCell>
                    <TableCell>
                      <Typography>{formatRelativeTime(log.createdAt)}</Typography>
                      <Typography color="text.secondary" variant="body2">{formatDateTime(log.createdAt)}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => openDrawer(log)}>Inspect</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Drawer
        anchor="right"
        open={Boolean(selectedLog)}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, maxWidth: '100%' } }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Audit event</Typography>
              <Typography color="text.secondary">Detailed activity record.</Typography>
            </Box>
            <IconButton onClick={closeDrawer} aria-label="Close audit detail drawer">
              <CloseIcon />
            </IconButton>
          </Stack>

          {selectedLog ? (
            <Stack spacing={3} sx={{ overflowY: 'auto', pb: 2 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">Action</Typography>
                <Typography fontWeight={700}>{selectedLog.action || 'UNKNOWN_ACTION'}</Typography>
              </Box>

              <Divider />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Actor</Typography>
                  <Typography fontWeight={700}>{selectedLog.adminEmail || 'Unavailable'}</Typography>
                </Grid>
                {selectedLog.module && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">Module</Typography>
                    <Typography fontWeight={700}>{selectedLog.module}</Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Time</Typography>
                  <Typography fontWeight={700}>{formatDateTime(selectedLog.createdAt)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Relative time</Typography>
                  <Typography fontWeight={700}>{formatRelativeTime(selectedLog.createdAt)}</Typography>
                </Grid>
              </Grid>

              {selectedLog.description && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">Description</Typography>
                  <Typography>{selectedLog.description}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" color="text.secondary">Event ID</Typography>
                <Typography sx={{ wordBreak: 'break-all' }}>{selectedLog.id}</Typography>
              </Box>

              <Button variant="contained" onClick={closeDrawer}>Close</Button>
            </Stack>
          ) : (
            <Typography color="text.secondary">Select an audit event to review its details.</Typography>
          )}
        </Box>
      </Drawer>
    </DashboardLayout>
  );
};

export default AdminAuditLogsPage;
