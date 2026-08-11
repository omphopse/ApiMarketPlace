import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import CodeBlock from '../components/CodeBlock';
import { adminService } from '../services/adminService';
import { statusOptions } from '../config/statusConfig';
import { statusConfig } from '../config/statusConfig';

const unavailable = 'Not returned by backend';

const AdminApiDetailPage = () => {
  const { apiId } = useParams();
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [docOpen, setDocOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(api?.status || 'PENDING');
  const [moderationReason, setModerationReason] = useState('');

  const loadApi = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getApiById(apiId);
      setApi(result);
    } catch (err) {
      setError(err.message || 'Unable to load API details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApi(); }, [apiId]);

  const handleArchive = async () => {
    await adminService.archiveApi(apiId);
    setArchiveOpen(false);
    await loadApi();
  };

  const openDocumentation = () => setDocOpen(true);

  const handleOpenStatus = () => {
    setSelectedStatus(api.status || 'PENDING');
    setModerationReason('');
    setStatusOpen(true);
  };

  const handleChangeStatus = async () => {
    await adminService.changeApiStatus(apiId, selectedStatus, moderationReason);
    setStatusOpen(false);
    await loadApi();
  };

  if (loading) return <DashboardLayout role="ADMIN" title="API details" subtitle="Inspect a marketplace API."><LoadingState title="Loading API" description="Fetching the record details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="API details" subtitle="Inspect a marketplace API."><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return <DashboardLayout role="ADMIN" title="API details" subtitle="Inspect a marketplace API."><Alert severity="warning">The requested API could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="API details" subtitle="Review configuration, plans and activity.">
      <PageHeader title={api.name} subtitle={api.description || 'No description provided.'} action={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate('/admin/apis')}>Back</Button><Button variant="contained" color="primary" onClick={openDocumentation} sx={{ background: 'linear-gradient(135deg,#7c3aed,#5b21b6)', color: '#fff' }}>✦ View Documentation</Button><Button variant="outlined" onClick={handleOpenStatus}>Change Status</Button></Stack>} />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} />
        <Chip label={api.categoryName || 'Category unavailable'} variant="outlined" />
        <Chip label={`v${api.version}`} variant="outlined" />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Overview" subtitle="Marketplace and technical summary">
            <Typography>{api.description || 'No description provided.'}</Typography>
            <Typography sx={{ mt: 2 }}><strong>Base URL:</strong> {api.baseUrl || 'Unavailable'}</Typography>
            <Typography><strong>Authentication:</strong> {api.authenticationType || unavailable}</Typography>
            <Typography><strong>Rate Limit:</strong> {api.rateLimit ?? unavailable}{api.rateLimit == null ? '' : ' req/min'}</Typography>
            <Typography><strong>Timeout:</strong> {api.timeout != null ? `${api.timeout}s` : unavailable}</Typography>
          </AppCard>
          <AppCard title="Plans" subtitle="Current pricing tiers" sx={{ mt: 3 }}>
            {api.plans?.length ? (
              api.plans.map((plan) => (
                <Box key={plan.id} sx={{ mb: 2, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight={700}>{plan.planName || 'Unnamed plan'}</Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    {plan.billingCycle || 'Unknown billing cycle'} • {plan.requestLimit || 0} requests • {plan.active ? 'Active' : 'Inactive'}
                  </Typography>
                  <Typography sx={{ mt: 1 }}><strong>Price:</strong> {plan.price != null ? `₹${plan.price}` : 'Not provided'}</Typography>
                </Box>
              ))
            ) : (
              <Typography color="text.secondary">No subscription plans were returned for this API.</Typography>
            )}
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Provider details" subtitle="Ownership and reach">
            <Typography><strong>Provider:</strong> {api.providerName || 'Provider unavailable'}</Typography>
            <Typography><strong>Subscribers:</strong> {api.subscribers || 0}</Typography>
            <Typography><strong>Requests:</strong> {api.requests || 0}</Typography>
            <Typography><strong>Revenue:</strong> ₹{api.revenue || 0}</Typography>
          </AppCard>
          <AppCard title="Review history" subtitle="Moderation actions" sx={{ mt: 3 }}>
            {(api.activity || []).slice(0, 5).map((entry) => <Typography key={entry.id} sx={{ mb: 1 }}>{entry.label}</Typography>)}
            {api.rejectionReason && <Alert severity="warning" sx={{ mt: 1 }}>Rejection reason: {api.rejectionReason}</Alert>}
          </AppCard>
        </Grid>
      </Grid>
      <Dialog
        open={docOpen}
        onClose={() => setDocOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            backgroundColor: '#111111',
            color: '#F5F3FF',
            opacity: 1,
            backgroundImage: 'none',
            boxShadow: '0 30px 80px rgba(0,0,0,0.65)',
            border: '1px solid rgba(255,255,255,0.08)'
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'none'
          }
        }}
      >
        <DialogTitle sx={{ color: '#FFFFFF' }}>API Documentation — {api.name}</DialogTitle>
        <DialogContent dividers>
          {api.documentation ? (
            <Box sx={{ '& pre': { whiteSpace: 'pre-wrap' } }}>
              {api.documentation.markdown && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Overview</Typography><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{api.documentation.markdown}</Typography></Box>}
              {api.documentation.authenticationGuide && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Authentication</Typography><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{api.documentation.authenticationGuide}</Typography></Box>}
              {api.baseUrl && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Base URL</Typography><CodeBlock language="text" title="Base URL" code={api.baseUrl} /></Box>}
              {api.documentation.headers && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Headers</Typography><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{api.documentation.headers}</Typography></Box>}
              {api.documentation.requestExample && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Request example</Typography><CodeBlock language="json" code={api.documentation.requestExample} /></Box>}
              {api.documentation.responseExample && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Response example</Typography><CodeBlock language="json" code={api.documentation.responseExample} /></Box>}
              {api.documentation.errorCodes && <Box sx={{ mb: 2 }}><Typography variant="h6" sx={{ color: '#FFFFFF' }}>Errors</Typography><Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{api.documentation.errorCodes}</Typography></Box>}
            </Box>
          ) : (
            <Typography color="text.secondary">No documentation is available for this API.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Change API Status</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>Current status: <strong>{api.status}</strong></Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="status-select-label">New status</InputLabel>
            <Select labelId="status-select-label" value={selectedStatus} label="New status" onChange={(e) => setSelectedStatus(e.target.value)}>
              {statusOptions.filter(s => s !== 'ALL').map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
            </Select>
          </FormControl>
          <TextField fullWidth multiline minRows={3} label="Reason (optional)" value={moderationReason} onChange={(e) => setModerationReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangeStatus}>Update Status</Button>
        </DialogActions>
      </Dialog>
      <ConfirmDialog open={archiveOpen} title="Archive this API?" description="Archived APIs will no longer appear in the public marketplace." confirmLabel="Archive API" onClose={() => setArchiveOpen(false)} onConfirm={handleArchive} />
    </DashboardLayout>
  );
};

export default AdminApiDetailPage;
