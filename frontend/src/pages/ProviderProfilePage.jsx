import { useEffect, useState } from 'react';
import { Alert, Avatar, Box, Button, Card, Grid, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { providerService } from '../services/providerService';
import { toast } from 'react-toastify';

const ProviderProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [initialProfile, setInitialProfile] = useState(null);

  const load = async () => {
    try {
      setError('');
      const p = await providerService.getProfile();
      setProfile(p);
      setInitialProfile(p);
      setForm({
        companyName: p.companyName || '',
        website: p.website || '',
        description: p.description || '',
        supportEmail: p.supportEmail || '',
        contactNumber: p.contactNumber || '',
        country: p.country || '',
        logo: p.logo || ''
      });
    } catch (err) {
      setError(err.message || 'Unable to load provider profile.');
    }
  };

  useEffect(() => { load(); }, []);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const validate = () => {
    if (!form.companyName || !form.companyName.trim()) return 'Company name is required.';
    if (!form.supportEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.supportEmail)) return 'Valid support email is required.';
    if (form.website && !/^(https?:\/\/)?[\w\-]+(\.[\w\-]+)+(:\d+)?(\/\S*)?$/.test(form.website)) return 'Website must be a valid URL.';
    return null;
  };

  const save = async () => {
    const v = validate();
    if (v) return toast.error(v);
    try {
      setSaving(true);
      setError('');
      const updated = await providerService.updateProfile(form);
      setProfile(updated);
      setInitialProfile(updated);
      setForm({
        companyName: updated.companyName || '',
        website: updated.website || '',
        description: updated.description || '',
        supportEmail: updated.supportEmail || '',
        contactNumber: updated.contactNumber || '',
        country: updated.country || '',
        logo: updated.logo || ''
      });
      toast.success('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to save provider profile.');
      toast.error(err.message || 'Unable to save provider profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // client-side validation
    const allowed = ['image/png', 'image/jpeg', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (!allowed.includes(file.type)) return setUploadError('Unsupported file type. Please upload PNG or JPEG.');
    if (file.size > maxSize) return setUploadError('File too large. Max 5MB.');

    try {
      setUploading(true);
      setUploadError('');
      const uploadedUrl = await providerService.uploadLogo(file);
      setForm((prev) => ({ ...prev, logo: uploadedUrl }));
      setProfile((prev) => ({ ...prev, logo: uploadedUrl }));
      toast.success('Logo uploaded.');
    } catch (err) {
      setUploadError(err.message || 'Unable to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    if (!initialProfile) return;
    setForm({
      companyName: initialProfile.companyName || '',
      website: initialProfile.website || '',
      description: initialProfile.description || '',
      supportEmail: initialProfile.supportEmail || '',
      contactNumber: initialProfile.contactNumber || '',
      country: initialProfile.country || '',
      logo: initialProfile.logo || ''
    });
    toast.info('Changes reverted.');
  };

  if (error && !profile) return <DashboardLayout role="PROVIDER" title="Provider profile"><ErrorState message={error} retryLabel="Try again" onRetry={load} /></DashboardLayout>;
  if (!profile || !form) return <DashboardLayout role="PROVIDER" title="Provider profile"><LoadingState title="Loading provider profile" /></DashboardLayout>;

  return (
    <DashboardLayout role="PROVIDER" title="Provider profile" subtitle="Edit profile fields persisted by Spring Boot.">
      <PageHeader title="Provider profile" subtitle="Company and support information" />
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {uploadError && <Alert severity="error" sx={{ mb: 2 }}>{uploadError}</Alert>}

      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <AppCard title="Company profile" subtitle="Profile and support information">
          <form onSubmit={(e) => { e.preventDefault(); save(); }}>
            <Grid container spacing={3} alignItems="flex-start">
              <Grid item xs={12} md={4}>
                <Stack spacing={2} alignItems="center">
                  {form.logo ? (
                    <Avatar src={form.logo} sx={{ width: 140, height: 140, borderRadius: 2 }} />
                  ) : (
                    <Avatar sx={{ width: 140, height: 140, bgcolor: 'grey.100', color: 'text.primary', fontSize: 36 }}>{(form.companyName || profile.companyName || 'P').charAt(0)}</Avatar>
                  )}

                  <Button variant="outlined" component="label" disabled={uploading} size="small">
                    {uploading ? 'Uploading…' : 'Upload logo'}
                    <input hidden accept="image/png, image/jpeg, image/jpg" type="file" onChange={handleLogoUpload} />
                  </Button>

                  <Typography variant="caption" color="text.secondary">PNG or JPG — max 5MB</Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Company name" value={form.companyName} onChange={update('companyName')} required />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Website" value={form.website} onChange={update('website')} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Support email" value={form.supportEmail} onChange={update('supportEmail')} required />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Contact number" value={form.contactNumber} onChange={update('contactNumber')} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Country" value={form.country} onChange={update('country')} />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField fullWidth label="Description" value={form.description} onChange={update('description')} multiline minRows={4} />
                  </Grid>

                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button variant="outlined" onClick={reset}>Reset</Button>
                    <Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        </AppCard>
      </Box>
    </DashboardLayout>
  );
};

export default ProviderProfilePage;
