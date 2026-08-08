import { useEffect, useState } from 'react';
import { Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { consumerService } from '../services/consumerService';
import { toast } from 'react-toastify';

const ApiKeysPage = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedKey, setSelectedKey] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [mode, setMode] = useState('revoke');
  const [newKey, setNewKey] = useState('');
  const [showRawKey, setShowRawKey] = useState(false);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getApiKeys();
      setApiKeys(result);
    } catch (err) {
      setError(err.message || 'Unable to load API keys.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApiKeys();
  }, []);

  const handleRegenerate = async (key) => {
    setSelectedKey(key);
    setMode('regenerate');
    setConfirmOpen(true);
  };

  const handleRevoke = async (key) => {
    setSelectedKey(key);
    setMode('revoke');
    setConfirmOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedKey) return;
    try {
      if (mode === 'regenerate') {
        const result = await consumerService.regenerateApiKey(selectedKey.subscriptionId);
        setNewKey(result.key);
        setShowRawKey(true);
        toast.success('API key regenerated.');
      } else {
        await consumerService.revokeApiKey(selectedKey.id);
        toast.success('API key revoked.');
      }
      setConfirmOpen(false);
      loadApiKeys();
    } catch (err) {
      toast.error(err.message || 'Unable to complete the request.');
    }
  };

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(newKey);
      toast.success('API key copied.');
    } catch {
      toast.error('Unable to copy API key.');
    }
  };

  return (
    <DashboardLayout role="CONSUMER" title="API keys" subtitle="Manage developer credentials securely.">
      <PageHeader title="API Keys" subtitle="Manage credentials for your subscribed APIs." action={<Button variant="contained" onClick={() => loadApiKeys()}>Refresh</Button>} />
      <AppCard title="Security notice" subtitle="Never expose API keys in reusable frontend code or public repositories.">
        <Typography color="text.secondary">Mock credentials are shown once for demonstration purposes and then stay masked in the UI.</Typography>
      </AppCard>
      <AppCard title="Active keys" subtitle="Current credentials for your subscriptions" sx={{ mt: 3 }}>
        {loading ? <LoadingState title="Loading API keys" description="Fetching your developer credentials." /> : error ? <ErrorState message={error} retryLabel="Try again" onRetry={loadApiKeys} /> : apiKeys.length === 0 ? <EmptyState title="No API keys yet" description="Subscribe to an API to generate your first key." actionLabel="Explore APIs" actionTo="/marketplace" /> : <Stack spacing={2}>{apiKeys.map((key) => <Box key={key.id} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}><Box><Typography fontWeight={700}>{key.label}</Typography><Typography color="text.secondary">{key.maskedKey}</Typography><Typography variant="body2" color="text.secondary">Created {key.createdAt} • Last used {key.lastUsed}</Typography></Box><Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}><Chip label={key.status} color={key.status === 'ACTIVE' ? 'success' : 'default'} /><Button onClick={() => handleRegenerate(key)} variant="outlined">Regenerate</Button><Button onClick={() => handleRevoke(key)} color="error">Revoke</Button></Stack></Stack></Box>)}</Stack>}
      </AppCard>
      {showRawKey && <AppCard title="New API key" subtitle="Copy this raw key now" sx={{ mt: 3 }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}><Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{newKey}</Typography><Button variant="contained" onClick={copyKey}>Copy key</Button></Stack></AppCard>}
      <ConfirmDialog open={confirmOpen} title={mode === 'regenerate' ? 'Regenerate API key?' : 'Revoke API key?'} description={mode === 'regenerate' ? 'The current key will stop working immediately.' : 'Revoking this key will disable access until a new one is created.'} confirmLabel={mode === 'regenerate' ? 'Regenerate key' : 'Revoke key'} onClose={() => setConfirmOpen(false)} onConfirm={confirmAction} />
    </DashboardLayout>
  );
};

export default ApiKeysPage;
