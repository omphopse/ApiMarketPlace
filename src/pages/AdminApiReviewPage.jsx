import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Chip, Dialog, Grid, Stack, Tab, Tabs, TextField, Typography, Alert, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminService } from '../services/adminService';
import { statusConfig } from '../config/statusConfig';
import { toast } from 'react-toastify';

const AdminApiReviewPage = () => {
  const { apiId } = useParams();
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState(0);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState('');

  const loadApi = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getApiForReview(apiId);
      setApi(result);
    } catch (err) {
      setError(err.message || 'Unable to load review details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApi(); }, [apiId]);

  const handleApprove = async () => {
    try {
      await adminService.approveApi(apiId);
      setApproveOpen(false);
      await loadApi();
    } catch (err) {
      toast.error(err.message || 'Unable to approve API.');
    }
  };

  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('A rejection reason is required.');
      return;
    }
    try {
      await adminService.rejectApi(apiId, reason);
      setRejectOpen(false);
      setReason('');
      await loadApi();
    } catch (err) {
      toast.error(err.message || 'Unable to reject API.');
    }
  };

  const reviewHistory = useMemo(() => [
    { title: 'Submission received', detail: `${api?.name || 'API'} submitted for review.` },
    { title: 'Documentation reviewed', detail: 'Provider documentation is available for evaluation.' },
    { title: api?.status === 'REJECTED' ? 'Rejected by admin' : 'Awaiting review', detail: api?.rejectionReason || 'No admin decision yet.' }
  ], [api]);

  if (loading) return <DashboardLayout role="ADMIN" title="API review" subtitle="Review marketplace submissions."><LoadingState title="Loading API review" description="Fetching the submission details." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="API review" subtitle="Review marketplace submissions."><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return <DashboardLayout role="ADMIN" title="API review" subtitle="Review marketplace submissions."><Alert severity="warning">The requested API could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="API review" subtitle="Evaluate the submission before publishing.">
      <PageHeader title={api.name} subtitle={api.shortDescription} action={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate('/admin/api-approvals')}>Back</Button>{api.status === 'PENDING' && <><Button variant="contained" color="success" onClick={() => setApproveOpen(true)}>Approve API</Button><Button variant="contained" color="error" onClick={() => setRejectOpen(true)}>Reject API</Button></>}</Stack>} />
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip label={statusConfig[api.status]?.label || api.status} color={statusConfig[api.status]?.color || 'default'} />
          <Chip label={`v${api.version}`} variant="outlined" />
          <Chip label={api.category} variant="outlined" />
        </Stack>
        <Typography color="text.secondary">Submitted {new Date(api.createdAt).toLocaleDateString()}</Typography>
      </Box>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Technical Configuration" />
        <Tab label="Plans" />
        <Tab label="Documentation" />
        <Tab label="Provider" />
        <Tab label="Review History" />
      </Tabs>
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <AppCard title="Overview" subtitle="Marketplace listing summary">
              <Typography fontWeight={700}>{api.name}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>{api.fullDescription}</Typography>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Category</Typography><Typography fontWeight={700}>{api.category}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Version</Typography><Typography fontWeight={700}>{api.version}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Created</Typography><Typography fontWeight={700}>{new Date(api.createdAt).toLocaleDateString()}</Typography></Grid>
                <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Last Updated</Typography><Typography fontWeight={700}>{new Date(api.lastUpdated).toLocaleDateString()}</Typography></Grid>
              </Grid>
            </AppCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <AppCard title="API branding" subtitle="Visual review context">
              <Box component="img" src={api.logo} alt={api.name} sx={{ width: '100%', borderRadius: 3, objectFit: 'cover', maxHeight: 220 }} />
              <Typography sx={{ mt: 2 }}><strong>Tags:</strong> {api.tags?.join(', ') || 'No tags'}</Typography>
            </AppCard>
          </Grid>
        </Grid>
      )}
      {tab === 1 && (
        <AppCard title="Technical Configuration" subtitle="Review backend-facing settings">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Base URL</Typography><Typography fontWeight={700}>{api.baseUrl || 'Not provided'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Authentication Type</Typography><Typography fontWeight={700}>{api.authType || 'Not provided'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Rate Limit</Typography><Typography fontWeight={700}>{api.rateLimit || '0'} req/min</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Timeout</Typography><Typography fontWeight={700}>{api.timeout || '0'}s</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Support URL</Typography><Typography fontWeight={700}>{api.supportUrl || 'Not provided'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Version</Typography><Typography fontWeight={700}>{api.version}</Typography></Grid>
          </Grid>
        </AppCard>
      )}
      {tab === 2 && (
        <AppCard title="Plans" subtitle="Inspect pricing and access tiers">
          <Stack spacing={2}>
            {(api.plans || []).map((plan) => (
              <Box key={plan.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={700}>{plan.name}</Typography>
                <Typography color="text.secondary">{plan.description}</Typography>
                <Typography sx={{ mt: 1 }}><strong>Price:</strong> ₹{plan.price}</Typography>
                <Typography><strong>Billing Cycle:</strong> {plan.billingCycle}</Typography>
                <Typography><strong>Request Limit:</strong> {plan.requestLimit}</Typography>
              </Box>
            ))}
          </Stack>
        </AppCard>
      )}
      {tab === 3 && (
        <AppCard title="Documentation" subtitle="Evaluate completeness and quality">
          <Typography whiteSpace="pre-line">{api.documentation?.markdown || 'No documentation was supplied.'}</Typography>
        </AppCard>
      )}
      {tab === 4 && (
        <AppCard title="Provider" subtitle="Business and contact context">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Provider</Typography><Typography fontWeight={700}>{api.providerName || 'Northstar Labs'}</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Company</Typography><Typography fontWeight={700}>Northstar Labs</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Website</Typography><Typography fontWeight={700}>https://northstarlabs.dev</Typography></Grid>
            <Grid item xs={12} sm={6}><Typography variant="body2" color="text.secondary">Support</Typography><Typography fontWeight={700}>support@northstarlabs.dev</Typography></Grid>
          </Grid>
        </AppCard>
      )}
      {tab === 5 && (
        <AppCard title="Review history" subtitle="Audit trail for moderation decisions">
          <Stack spacing={2}>
            {reviewHistory.map((entry) => (
              <Box key={entry.title} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography fontWeight={700}>{entry.title}</Typography>
                <Typography color="text.secondary">{entry.detail}</Typography>
              </Box>
            ))}
            {api.rejectionReason && <Alert severity="warning">Rejection reason: {api.rejectionReason}</Alert>}
          </Stack>
        </AppCard>
      )}
      <ConfirmDialog open={approveOpen} title="Approve this API?" description="Once approved, this API will become available in the marketplace." confirmLabel="Approve API" onClose={() => setApproveOpen(false)} onConfirm={handleApprove} />
      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>Reject API</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>Please provide a clear reason so the provider can fix the submission.</Typography>
          <TextField label="Rejection reason" value={reason} onChange={(event) => setReason(event.target.value)} multiline minRows={4} fullWidth sx={{ mt: 2 }} required />
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleReject}>Reject API</Button>
          </Stack>
        </Box>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminApiReviewPage;
