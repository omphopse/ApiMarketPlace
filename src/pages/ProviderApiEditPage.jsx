import { useEffect, useState } from 'react';
import { Box, Button, Grid, Stack, TextField, Typography, MenuItem } from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { providerService } from '../services/providerService';
import { categoryOptions } from '../config/statusConfig';
import { toast } from 'react-toastify';

const ProviderApiEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [api, setApi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadApi = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await providerService.getApiById(id);
      setApi(result);
    } catch (err) {
      setError(err.message || 'Unable to load API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApi();
  }, [id]);

  const handleSave = async () => {
    try {
      await providerService.updateApi(api.id, api);
      toast.success('API updated.');
      navigate(`/provider/apis/${api.id}`);
    } catch (err) {
      toast.error(err.message || 'Unable to update API.');
    }
  };

  if (loading) return <DashboardLayout role="PROVIDER" title="Edit API" subtitle="Update your current listing."><LoadingState title="Loading API" description="Preparing the edit form." /></DashboardLayout>;
  if (error) return <DashboardLayout role="PROVIDER" title="Edit API" subtitle="Update your current listing."><ErrorState message={error} retryLabel="Try again" onRetry={loadApi} /></DashboardLayout>;
  if (!api) return null;

  return (
    <DashboardLayout role="PROVIDER" title="Edit API" subtitle="Refine the marketplace listing.">
      <PageHeader title={`Edit ${api.name}`} subtitle="Adjust the description, metadata and configuration." action={<Button component={Link} to={`/provider/apis/${api.id}`} variant="outlined">Back</Button>} />
      <AppCard title="Editable details" subtitle="Update the API listing.">
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Name" value={api.name} onChange={(event) => setApi({ ...api, name: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth select label="Category" value={api.category} onChange={(event) => setApi({ ...api, category: event.target.value })}>
              {categoryOptions.map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Short Description" value={api.shortDescription} onChange={(event) => setApi({ ...api, shortDescription: event.target.value })} multiline minRows={2} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Full Description" value={api.fullDescription} onChange={(event) => setApi({ ...api, fullDescription: event.target.value })} multiline minRows={4} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Version" value={api.version} onChange={(event) => setApi({ ...api, version: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Base URL" value={api.baseUrl} onChange={(event) => setApi({ ...api, baseUrl: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Support URL" value={api.supportUrl} onChange={(event) => setApi({ ...api, supportUrl: event.target.value })} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Authentication" value={api.authType} onChange={(event) => setApi({ ...api, authType: event.target.value })} />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Tags" value={api.tags?.join(', ')} onChange={(event) => setApi({ ...api, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} />
          </Grid>
        </Grid>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
          <Button variant="contained" onClick={handleSave}>Save Changes</Button>
          <Button component={Link} to={`/provider/apis/${api.id}`} variant="outlined">Cancel</Button>
        </Stack>
      </AppCard>
    </DashboardLayout>
  );
};

export default ProviderApiEditPage;
