import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography, Alert } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [suspendOpen, setSuspendOpen] = useState(false);

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

  const handleSuspend = async () => {
    await adminService.suspendUser(userId, 'Policy review');
    setSuspendOpen(false);
    await loadUser();
  };

  const handleReactivate = async () => {
    await adminService.reactivateUser(userId);
    await loadUser();
  };

  if (loading) return <DashboardLayout role="ADMIN" title="User details" subtitle="Inspect account details."><LoadingState title="Loading user" description="Fetching the account profile." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="User details" subtitle="Inspect account details."><ErrorState message={error} retryLabel="Try again" onRetry={loadUser} /></DashboardLayout>;
  if (!user) return <DashboardLayout role="ADMIN" title="User details" subtitle="Inspect account details."><Alert severity="warning">The requested user could not be found.</Alert></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="User details" subtitle="Review account status and related data.">
      <PageHeader title={user.name} subtitle={user.email} action={<Stack direction="row" spacing={1}><Button variant="outlined" onClick={() => navigate('/admin/users')}>Back</Button>{user.status === 'ACTIVE' ? <Button variant="contained" color="error" onClick={() => setSuspendOpen(true)}>Suspend</Button> : <Button variant="contained" onClick={handleReactivate}>Reactivate</Button>}</Stack>} />
      <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap' }}>
        <Chip label={user.role} variant="outlined" />
        <Chip label={user.status} color={user.status === 'ACTIVE' ? 'success' : 'error'} />
      </Stack>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <AppCard title="Profile" subtitle="Account overview">
            <Typography><strong>Name:</strong> {user.name}</Typography>
            <Typography><strong>Email:</strong> {user.email}</Typography>
            <Typography><strong>Joined:</strong> {user.joinedAt}</Typography>
            <Typography><strong>Last active:</strong> {user.lastActive}</Typography>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <AppCard title="Account actions" subtitle="Maintain access and trust">
            {user.status === 'ACTIVE' ? <Button fullWidth variant="contained" color="error" onClick={() => setSuspendOpen(true)}>Suspend user</Button> : <Button fullWidth variant="contained" onClick={handleReactivate}>Reactivate user</Button>}
          </AppCard>
        </Grid>
      </Grid>
      <ConfirmDialog open={suspendOpen} title="Suspend this user?" description="Suspended accounts should not perform protected marketplace actions." confirmLabel="Suspend user" onClose={() => setSuspendOpen(false)} onConfirm={handleSuspend} />
    </DashboardLayout>
  );
};

export default AdminUserDetailPage;
