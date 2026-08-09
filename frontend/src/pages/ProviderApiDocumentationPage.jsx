import { useEffect, useState } from 'react';
import { Alert, Button, Card, Stack, TextField } from '@mui/material';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { providerService } from '../services/providerService';

const emptyDocumentation = { authenticationGuide: '', baseEndpoint: '', headers: '', requestExample: '', responseExample: '', errorCodes: '', markdown: '' };

const ProviderApiDocumentationPage = () => {
  const { id } = useParams();
  const [documentation, setDocumentation] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setError(''); setDocumentation(await providerService.getDocumentation(id)); } catch (err) { if (err.response?.status === 404) setDocumentation(emptyDocumentation); else setError(err.message || 'Unable to load documentation.'); }
  };
  useEffect(() => { load(); }, [id]);

  const save = async () => {
    try { setSaving(true); if (documentation?.id) await providerService.saveDocumentation(id, documentation); else await providerService.createDocumentation?.(id, documentation); await load(); } catch (err) { setError(err.message || 'Unable to save documentation.'); } finally { setSaving(false); }
  };

  if (error) return <DashboardLayout role="PROVIDER" title="Documentation"><ErrorState message={error} retryLabel="Try again" onRetry={load} /></DashboardLayout>;
  if (!documentation) return <DashboardLayout role="PROVIDER" title="Documentation"><LoadingState title="Loading documentation" /></DashboardLayout>;

  const update = (field) => (event) => setDocumentation({ ...documentation, [field]: event.target.value });
  return <DashboardLayout role="PROVIDER" title="API documentation" subtitle="Persist documentation through the provider API.">
    <PageHeader title="Documentation" subtitle={`API ${id}`} />
    {!documentation.id && <Alert severity="info" sx={{ mb: 2 }}>No documentation exists yet. Saving will create it.</Alert>}
    <Card sx={{ p: 2.5, borderRadius: 2 }}><Stack spacing={2}><TextField label="Authentication guide" multiline minRows={3} value={documentation.authenticationGuide || ''} onChange={update('authenticationGuide')} /><TextField label="Base endpoint" value={documentation.baseEndpoint || ''} onChange={update('baseEndpoint')} /><TextField label="Headers" multiline minRows={2} value={documentation.headers || ''} onChange={update('headers')} /><TextField label="Request example" multiline minRows={4} value={documentation.requestExample || ''} onChange={update('requestExample')} /><TextField label="Response example" multiline minRows={4} value={documentation.responseExample || ''} onChange={update('responseExample')} /><TextField label="Error codes" multiline minRows={2} value={documentation.errorCodes || ''} onChange={update('errorCodes')} /><TextField label="Markdown documentation" multiline minRows={8} value={documentation.markdown || ''} onChange={update('markdown')} /><Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save documentation'}</Button></Stack></Card>
  </DashboardLayout>;
};

export default ProviderApiDocumentationPage;
