import { useEffect, useMemo, useState } from 'react';
import { Avatar, Box, Button, Card, Chip, Divider, Grid, Stack, TextField, Typography, useMediaQuery, useTheme, Skeleton } from '@mui/material';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { consumerService } from '../services/consumerService';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ displayName: '', companyName: '', website: '', country: '' });
  const [uploading, setUploading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [apiKeys, setApiKeys] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const [p, db, keys] = await Promise.all([
        consumerService.getProfile(),
        consumerService.getDashboard().catch(() => null),
        consumerService.getApiKeys().catch(() => null)
      ]);
      setProfile(p);
      setDashboard(db);
      setApiKeys(keys);
      setForm({
        displayName: p.displayName || '',
        companyName: p.companyName || '',
        website: p.website || '',
        country: p.country || ''
      });
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await consumerService.updateProfile(form);
      setProfile(result);
      setEditMode(false);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.message || 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await consumerService.uploadProfileImage(file);
      setProfile((prev) => ({ ...prev, profileImage: imageUrl }));
      toast.success('Profile picture uploaded.');
    } catch (err) {
      toast.error(err.message || 'Unable to upload profile picture.');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({ displayName: profile.displayName || '', companyName: profile.companyName || '', website: profile.website || '', country: profile.country || '' });
    setEditMode(false);
  };

  const initials = useMemo(() => {
    const name = profile?.fullName || profile?.displayName || '';
    return name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() || '?';
  }, [profile]);

  if (loading) return <DashboardLayout role="CONSUMER" title="Profile" subtitle="Manage your consumer profile."><LoadingState title="Loading profile" description="Preparing your account settings." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Profile" subtitle="Manage your consumer profile."><ErrorState message={error} retryLabel="Try again" onRetry={loadProfile} /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Profile" subtitle="Manage your consumer profile.">
      <PageHeader title="Profile" subtitle="Maintain your account details and contact preferences." action={<Button variant="outlined" onClick={() => loadProfile()}>Refresh</Button>} />

      {/* Profile header */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Card variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
                <Avatar src={profile.profileImage} sx={{ width: 88, height: 88, fontSize: 28 }}>{!profile.profileImage && initials}</Avatar>
                <Box>
                  <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{profile.fullName || profile.displayName || '—'}</Typography>
                  <Typography color="text.secondary">{profile.email}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }} alignItems="center">
                    <Chip label={profile.role || 'Consumer'} size="small" />
                    {profile.status ? <Typography variant="body2" color="text.secondary">● {profile.status}</Typography> : null}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction="row" justifyContent={isMobile ? 'flex-start' : 'flex-end'} spacing={1}>
                <Button variant={editMode ? 'outlined' : 'contained'} onClick={() => setEditMode((s) => !s)}>{editMode ? 'Cancel' : 'Edit profile'}</Button>
                {editMode ? <Button variant="contained" color="primary" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button> : null}
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Box>

      <Grid container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Grid item xs={12} md={8}>
          <AppCard title="Personal information" subtitle="Manage the information associated with your APIHub account.">
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Stack spacing={2} alignItems="center">
                    {profile.profileImage ? (
                      <Avatar src={profile.profileImage} sx={{ width: 120, height: 120 }} />
                    ) : (
                      <Avatar sx={{ width: 120, height: 120, bgcolor: 'grey.100', color: 'text.primary', fontSize: 32 }}>{initials}</Avatar>
                    )}
                    <Button variant="outlined" component="label" disabled={uploading} size="small">
                      {uploading ? 'Uploading…' : 'Change photo'}
                      <input hidden accept="image/png, image/jpeg" type="file" onChange={handleProfileImageChange} />
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={9}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      {editMode ? (
                        <TextField fullWidth label="Full name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} helperText="Your full display name shown across the platform." />
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Full name</Typography>
                          <Typography fontWeight={700}>{profile.fullName || profile.displayName || '—'}</Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {editMode ? (
                        <TextField fullWidth label="Company" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Company</Typography>
                          <Typography fontWeight={700}>{profile.companyName || '—'}</Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {editMode ? (
                        <TextField fullWidth label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Website</Typography>
                          <Typography fontWeight={700}>{profile.website || '—'}</Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      {editMode ? (
                        <TextField fullWidth label="Country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                      ) : (
                        <Box>
                          <Typography variant="subtitle2" color="text.secondary">Country</Typography>
                          <Typography fontWeight={700}>{profile.country || '—'}</Typography>
                        </Box>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                        <Typography fontWeight={700}>{profile.email}</Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Role</Typography>
                        <Typography fontWeight={700}>{profile.role || 'Consumer'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* Sticky action row for mobile when editing */}
                  {editMode && isMobile && (
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="outlined" onClick={resetForm} fullWidth>Cancel</Button>
                      <Button variant="contained" type="submit" disabled={saving} fullWidth>{saving ? 'Saving…' : 'Save changes'}</Button>
                    </Stack>
                  )}
                </Grid>
              </Grid>
            </form>
          </AppCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">Account</Typography>
              <Typography fontWeight={700} sx={{ mt: 1 }}>{profile.fullName || profile.displayName || '—'}</Typography>
              <Typography color="text.secondary">{profile.email}</Typography>
              <Divider sx={{ my: 1 }} />
              <Stack spacing={1}>
                <Box><Typography variant="body2" color="text.secondary">Role</Typography><Typography fontWeight={700}>{profile.role || 'Consumer'}</Typography></Box>
                {profile.status && <Box><Typography variant="body2" color="text.secondary">Status</Typography><Typography fontWeight={700}>{profile.status}</Typography></Box>}
              </Stack>
            </Card>

            {/* API activity */}
            {(dashboard || apiKeys) ? (
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">API activity</Typography>
                <Grid container spacing={1} sx={{ mt: 1 }}>
                  {dashboard?.activeSubscriptions !== undefined && (
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">Subscriptions</Typography><Typography fontWeight={700}>{dashboard.activeSubscriptions}</Typography></Grid>
                  )}
                  {apiKeys && (
                    <Grid item xs={6}><Typography variant="body2" color="text.secondary">API keys</Typography><Typography fontWeight={700}>{apiKeys.length}</Typography></Grid>
                  )}
                  {dashboard?.totalRequestsThisMonth !== undefined && (
                    <Grid item xs={12} sx={{ mt: 1 }}><Typography variant="body2" color="text.secondary">Requests this month</Typography><Typography fontWeight={700}>{dashboard.totalRequestsThisMonth?.toLocaleString()}</Typography></Grid>
                  )}
                </Grid>

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button component={Link} to="/consumer/api-keys" size="small" variant="outlined">Manage API keys</Button>
                  <Button component={Link} to="/consumer/subscriptions" size="small" variant="outlined">View subscriptions</Button>
                </Stack>
              </Card>
            ) : null}
          </Stack>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default ProfilePage;
