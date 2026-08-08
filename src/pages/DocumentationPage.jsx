import { useEffect, useState } from 'react';
import { Box, Button, Drawer, List, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CodeBlock from '../components/CodeBlock';
import { consumerService } from '../services/consumerService';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'base-url', label: 'Base URL' },
  { id: 'headers', label: 'Headers' },
  { id: 'endpoints', label: 'Endpoints' },
  { id: 'response', label: 'Response' },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate Limits' }
];

const DocumentationPage = () => {
  const { subscriptionId } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await consumerService.getDocumentation(subscriptionId);
      if (!result) throw new Error('Documentation unavailable.');
      setDoc(result);
    } catch (err) {
      setError(err.message || 'Unable to load documentation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocumentation(); }, [subscriptionId]);

  if (loading) return <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guides for your active subscriptions."><LoadingState title="Loading docs" description="Preparing the API reference for you." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guides for your active subscriptions."><ErrorState message={error} retryLabel="Try again" onRetry={loadDocumentation} /></DashboardLayout>;
  if (!doc) return <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guides for your active subscriptions."><EmptyState title="Documentation unavailable" description="This subscription does not currently expose docs." actionLabel="Back to subscriptions" actionTo="/consumer/subscriptions" /></DashboardLayout>;

  return (
    <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guide and code snippets.">
      <PageHeader title={doc.api.name} subtitle="Secure developer documentation and examples." action={<Button variant="outlined" onClick={() => setDrawerOpen(true)}>Sections</Button>} />
      <AppCard title="Documentation preview" subtitle="Reference material for your subscription.">
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <Box sx={{ width: 220, p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography fontWeight={700}>Sections</Typography>
              <List>{sections.map((section) => <ListItemButton key={section.id} onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })}><ListItemText primary={section.label} /></ListItemButton>)}</List>
            </Box>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Box id="overview" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Overview</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{doc.api.fullDescription}</Typography></Box>
            <Box id="authentication" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Authentication</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{doc.documentation.authGuide}</Typography></Box>
            <Box id="base-url" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Base URL</Typography><CodeBlock language="bash" title="Base URL" code={doc.documentation.baseEndpoint} /></Box>
            <Box id="headers" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Headers</Typography><CodeBlock language="text" title="Headers" code={doc.documentation.headers} /></Box>
            <Box id="endpoints" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Endpoints</Typography><CodeBlock language="bash" title="cURL" code={`curl -H "X-API-Key: YOUR_API_KEY" ${doc.documentation.baseEndpoint}`} /></Box>
            <Box id="response" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Response Example</Typography><CodeBlock language="json" title="Response" code={doc.documentation.responseExample} /></Box>
            <Box id="errors" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Errors</Typography><Typography color="text.secondary">{doc.documentation.errorCodes}</Typography></Box>
            <Box id="rate-limits" sx={{ mb: 3 }}><Typography variant="h6" fontWeight={700}>Rate Limits</Typography><Typography color="text.secondary">{doc.api.rateLimit} requests per minute</Typography></Box>
          </Box>
        </Stack>
      </AppCard>
      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}><Box sx={{ p: 2 }}><Typography fontWeight={700}>Sections</Typography>{sections.map((section) => <Button key={section.id} fullWidth sx={{ justifyContent: 'flex-start', mt: 1 }} onClick={() => { document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' }); setDrawerOpen(false); }}>{section.label}</Button>)}</Box></Drawer>
    </DashboardLayout>
  );
};

export default DocumentationPage;
