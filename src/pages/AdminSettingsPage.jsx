import { useEffect, useState } from 'react';
import { Box, Button, Card, Grid, MenuItem, Stack, Switch, TextField, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getSettings();
      setSettings(response);
    } catch (err) {
      setError(err.message || 'Unable to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSettings(); }, []);

  const handleSave = async () => {
    try {
      await adminService.updateSettings(settings);
      toast.success('Settings updated.');
    } catch (err) {
      toast.error(err.message || 'Unable to save settings.');
    }
  };

  if (loading) return <DashboardLayout role="ADMIN" title="Settings" subtitle="Configure mock marketplace defaults."><LoadingState title="Loading settings" description="Fetching the admin configuration." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Settings" subtitle="Configure mock marketplace defaults."><ErrorState message={error} retryLabel="Try again" onRetry={loadSettings} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Settings" subtitle="Mock platform configuration only.">
      <PageHeader title="Settings" subtitle="Manage mock marketplace defaults and moderation preferences." action={<Button variant="contained" onClick={handleSave}>Save settings</Button>} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <AppCard title="Marketplace" subtitle="Basic visibility and access controls">
            <Stack spacing={2}>
              <TextField label="Marketplace Name" value={settings.marketplaceName || ''} onChange={(event) => setSettings({ ...settings, marketplaceName: event.target.value })} />
              <TextField label="Support Email" value={settings.supportEmail || ''} onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })} />
              <TextField label="Default Currency" value={settings.defaultCurrency || ''} onChange={(event) => setSettings({ ...settings, defaultCurrency: event.target.value })} />
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <AppCard title="Moderation" subtitle="Approval and review preferences">
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography>Require API approval</Typography><Switch checked={Boolean(settings.requireApiApproval)} onChange={(_, checked) => setSettings({ ...settings, requireApiApproval: checked })} /></Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography>Allow resubmission</Typography><Switch checked={Boolean(settings.allowResubmission)} onChange={(_, checked) => setSettings({ ...settings, allowResubmission: checked })} /></Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography>Show rejection reasons to providers</Typography><Switch checked={Boolean(settings.showRejectionReasonsToProviders)} onChange={(_, checked) => setSettings({ ...settings, showRejectionReasonsToProviders: checked })} /></Stack>
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12}>
          <AppCard title="Payments" subtitle="Mock configuration">
            <Stack spacing={2}>
              <TextField label="Payment Provider" value={settings.paymentProvider || ''} onChange={(event) => setSettings({ ...settings, paymentProvider: event.target.value })} />
              <TextField label="Platform Fee %" value={settings.platformFeePercent || 0} onChange={(event) => setSettings({ ...settings, platformFeePercent: Number(event.target.value) })} />
              <TextField label="Currency" value={settings.currency || ''} onChange={(event) => setSettings({ ...settings, currency: event.target.value })} />
            </Stack>
          </AppCard>
        </Grid>
      </Grid>
    </DashboardLayout>
  );
};

export default AdminSettingsPage;
