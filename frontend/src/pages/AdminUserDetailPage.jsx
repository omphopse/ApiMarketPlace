import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminService } from '../services/adminService';

const AdminUserDetailPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await adminService.getUserById(userId);
      setUser(result);
    } catch (err) {
      setError(err.message || 'Unable to load user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUser(); }, [userId]);

  const isSelfAccount = currentUser?.userId === userId;

  const handleSuspend = async () => {
    try {
      await adminService.suspendUser(userId, 'Policy review');
      setSuspendOpen(false);
      await loadUser();
    } catch (err) {
      setError(err.message || 'Unable to disable user.');
    }
  };

  const handleReactivate = async () => {
    try {
      await adminService.reactivateUser(userId);
      await loadUser();
    } catch (err) {
      setError(err.message || 'Unable to enable user.');
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteUser(userId);
      setDeleteOpen(false);
      navigate('/admin/users');
    } catch (err) {
      setError(err.message || 'Unable to delete user.');
    }
  };

  if (loading) return <DashboardLayout role="ADMIN" title="User details" subtitle="Inspect account details."><LoadingState title="Loading user" description="Fetching the account profile." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="User details" subtitle="Inspect account details."><ErrorState message={error} retryLabel="Try again" onRetry={loadUser} /></DashboardLayout>;
  if (!user) return <DashboardLayout role="ADMIN" title="User details" subtitle="Inspect account details."><Alert severity="warning">The requested user could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="User details" subtitle="Review account status and related data.">
      <PageHeader title={user.fullName || 'User details'} subtitle={user.email} action={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate('/admin/users')}>Back</Button>{!isSelfAccount && <><Button variant="contained" color="error" onClick={() => setSuspendOpen(true)}>Disable access</Button><Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Delete</Button></>}</Stack>} />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label={user.role} variant="outlined" />
        <Chip label={user.status || 'Status not returned'} color={user.status === 'ACTIVE' ? 'success' : 'default'} />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Profile" subtitle="Account overview">
            <Typography><strong>Name:</strong> {user.fullName || 'Unavailable'}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Account status:</strong> {user.status || 'Not returned by backend'}</Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Account actions" subtitle="Maintain access and trust">
            {isSelfAccount ? (
              <Alert severity="info">Your administrator account cannot be disabled or deleted from this panel.</Alert>
            ) : (
              <Stack spacing={1}>
                <Button fullWidth variant="contained" color="error" onClick={() => setSuspendOpen(true)}>Disable access</Button>
                <Button fullWidth variant="outlined" onClick={handleReactivate}>Enable access</Button>
                <Button fullWidth variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Delete user</Button>
              </Stack>
            )}
          </AppCard>
        </Grid>
      </Grid>
      <ConfirmDialog open={suspendOpen} title="Suspend this user?" description="Suspended accounts should not perform protected marketplace actions." confirmLabel="Suspend user" onClose={() => setSuspendOpen(false)} onConfirm={handleSuspend} />
      <ConfirmDialog open={deleteOpen} title="Delete this user?" description="This sends the delete request to the backend and cannot be undone from this page." confirmLabel="Delete user" onClose={() => setDeleteOpen(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  );
};

export default AdminUserDetailPage;
