import { useEffect, useState } from 'react';
import { Button, Grid, Stack, TextField, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { consumerService } from '../services/consumerService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' });

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getProfile();
      setProfile(result);
      setForm({ name: result.name, company: result.company, email: result.email, phone: result.phone });
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await consumerService.updateProfile(form);
      setProfile(result);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err.message || 'Unable to update profile.');
    }
  };

  if (loading) return <DashboardLayout role="CONSUMER" title="Profile" subtitle="Manage your consumer profile."><LoadingState title="Loading profile" description="Preparing your account settings." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Profile" subtitle="Manage your consumer profile."><ErrorState message={error} retryLabel="Try again" onRetry={loadProfile} /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Profile" subtitle="Manage your consumer profile.">
      <PageHeader title="Profile" subtitle="Maintain your account details and contact preferences." action={<Button variant="outlined" onClick={() => loadProfile()}>Refresh</Button>} />
      <AppCard title="Account details" subtitle="Mock profile settings for the demo experience.">
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><TextField fullWidth label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Company" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></Grid>
            <Grid item xs={12} md={6}><TextField fullWidth label="Phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></Grid>
          </Grid>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">Save changes</Button>
            <Button variant="outlined" onClick={() => setForm({ name: profile.name, company: profile.company, email: profile.email, phone: profile.phone })}>Reset</Button>
          </Stack>
        </form>
      </AppCard>
      <AppCard title="Preferences" subtitle="Current mock preferences" sx={{ mt: 3 }}>
        <Typography color="text.secondary">Notification emails: {profile.notificationsEnabled ? 'Enabled' : 'Disabled'}</Typography>
        <Typography color="text.secondary">Plan visibility: {profile.planVisibility}</Typography>
      </AppCard>
    </DashboardLayout>
  );
};

export default ProfilePage;
