import { useEffect, useState } from 'react';
import { Box, Button, Drawer, List, ListItemButton, ListItemText, Stack, Typography, Grid, Paper } from '@mui/material';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import CodeBlock from '../components/CodeBlock';
import { consumerService } from '../services/consumerService';

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'apihub-execute', label: 'APIHub execute' },
  { id: 'provider-endpoint', label: 'Provider endpoint' },
  { id: 'headers', label: 'Headers' },
  { id: 'request', label: 'Request' },
  { id: 'response', label: 'Response' },
  { id: 'errors', label: 'Errors' },
  { id: 'rate-limits', label: 'Rate limits' }
];

const DocumentationPage = () => {
  const { subscriptionId } = useParams();
  const [doc, setDoc] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');

  const loadDocumentation = async () => {
    try {
      setLoading(true);
      setError('');
      const [result, subscriptionDetails] = await Promise.all([
        consumerService.getDocumentation(subscriptionId),
        consumerService.getSubscriptionById(subscriptionId)
      ]);
      if (!result) throw new Error('Documentation unavailable.');
      setDoc(result);
      setSubscription(subscriptionDetails);
    } catch (err) {
      setError(err.message || 'Unable to load documentation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocumentation(); }, [subscriptionId]);

  // Scroll spy to update active section
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id);
      });
    }, { root: null, rootMargin: '0px 0px -60% 0px', threshold: 0 });

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [doc]);

  if (loading) return <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guides for your active subscriptions."><LoadingState title="Loading docs" description="Preparing the API reference for you." /></DashboardLayout>;
  if (error) return <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guides for your active subscriptions."><ErrorState message={error} retryLabel="Try again" onRetry={loadDocumentation} /></DashboardLayout>;
  if (!doc) return <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guides for your active subscriptions."><EmptyState title="Documentation unavailable" description="This subscription does not currently expose docs." actionLabel="Back to subscriptions" actionTo="/consumer/subscriptions" /></DashboardLayout>;

  const apiHubExecutePathPlaceholder = '/api/marketplace/apis/{apiId}/execute';
  const apiHubExecuteUrlPlaceholder = `${window.location.origin}${apiHubExecutePathPlaceholder}`;
  const supportedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  // Helper to check availability of sections
  const has = {
    overview: Boolean(doc.markdown),
    'how-it-works': Boolean(doc.markdown || doc.authenticationGuide || doc.baseEndpoint),
    authentication: Boolean(doc.authenticationGuide || doc.headers),
    'apihub-execute': Boolean(doc.apiId || doc.baseEndpoint),
    'provider-endpoint': Boolean(doc.baseEndpoint),
    headers: Boolean(doc.headers),
    request: Boolean(doc.requestExample),
    response: Boolean(doc.responseExample),
    errors: Boolean(doc.errorCodes),
    'rate-limits': subscription?.requestLimit != null
  };

  return (
    <DashboardLayout role="CONSUMER" title="Documentation" subtitle="Developer guide and code snippets.">
      <PageHeader title={subscription?.apiName || 'API documentation'} subtitle={subscription?.providerName || 'Consumer'} action={<Button variant="outlined" onClick={() => setDrawerOpen(true)}>Sections</Button>} />

      <Grid container justifyContent="center">
        <Grid item xs={12} lg={10} sx={{ px: { xs: 2, md: 0 } }}>
          <Paper elevation={0} sx={{ p: { xs: 2, md: 0 }, bgcolor: 'transparent' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {subscription?.logo && <Box component="img" src={subscription.logo} alt={subscription.apiName} sx={{ width: 64, height: 64, borderRadius: 1 }} />}
              <Box>
                <Typography variant="h5" fontWeight={700}>{subscription?.apiName}</Typography>
                {doc.shortDescription && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{doc.shortDescription}</Typography>}
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {subscription?.category && <Typography variant="caption" sx={{ px: 1, py: 0.5, border: '1px solid', borderColor: 'divider' }}>{subscription.category}</Typography>}
                  {subscription?.version && <Typography variant="caption" sx={{ px: 1, py: 0.5, border: '1px solid', borderColor: 'divider' }}>{`v${subscription.version}`}</Typography>}
                </Box>
              </Box>
              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                {doc.baseEndpoint && <Button variant="outlined" onClick={() => navigator.clipboard.writeText(doc.baseEndpoint)}>Copy Base URL</Button>}
                <Button component={"a"} href="/consumer/subscriptions" variant="text">Back to subscriptions</Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
                <Box sx={{ position: 'sticky', top: 96 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography fontWeight={700} sx={{ mb: 1 }}>On this page</Typography>
                    <List disablePadding>
                      {sections.filter(s => has[s.id]).map((section) => (
                        <ListItemButton key={section.id} selected={activeSection === section.id} onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })} sx={{ py: 0.5 }}>
                          <ListItemText primary={section.label} primaryTypographyProps={{ variant: 'body2', color: activeSection === section.id ? 'primary.main' : 'text.primary' }} />
                        </ListItemButton>
                      ))}
                    </List>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={9}>
                <Box sx={{ maxWidth: 900 }}>
                  {has.overview && <Box id="overview" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Overview</Typography><Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{doc.markdown || 'Use the APIHub gateway to invoke this API from a single developer endpoint. APIHub handles API key authentication, request forwarding, and response delivery from the provider.'}</Typography></Box>}

                  {has['how-it-works'] && <Box id="how-it-works" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>How it works</Typography><Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>APIHub exposes this API through a managed gateway endpoint. Your client calls APIHub, and APIHub forwards the request to the provider backend URL listed below. Your subscription and API key are validated before the request is forwarded.</Typography></Box>}

                  {has.authentication && <Box id="authentication" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Authentication</Typography><Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>All requests to APIHub must include your consumer API key in the <code>X-API-Key</code> header. Do not send provider credentials directly to the provider endpoint. APIHub uses the key to authenticate your subscription and authorize the request.</Typography>{doc.authenticationGuide ? <Typography color="text.secondary" sx={{ mt: 2, whiteSpace: 'pre-line' }}>{doc.authenticationGuide}</Typography> : null}</Box>}

                  {has['apihub-execute'] && <Box id="apihub-execute" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>APIHub execute endpoint</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Use the APIHub gateway URL below as the developer-facing access point for this API. APIHub will forward the request to the provider’s base endpoint.</Typography>
                    <Box sx={{ mt: 2 }}><CodeBlock language="text" title="APIHub Execute URL" code={apiHubExecuteUrlPlaceholder} /></Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                      <Button variant="outlined" size="small" onClick={() => navigator.clipboard.writeText(apiHubExecuteUrlPlaceholder)}>Copy execute URL</Button>
                      <Button variant="outlined" size="small" onClick={() => navigator.clipboard.writeText(apiHubExecutePathPlaceholder)}>Copy relative path</Button>
                    </Stack>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Supported request methods</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.5 }}>{supportedMethods.join(', ')}</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2">Example request</Typography>
                      <CodeBlock language="bash" title="Curl example" code={`curl -X POST "${apiHubExecuteUrlPlaceholder}" \
  -H "X-API-Key: YOUR_API_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{"example": "payload"}'`} />
                    </Box>
                  </Box>}

                  {has['provider-endpoint'] && <Box id="provider-endpoint" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Provider endpoint</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>This is the provider backend base endpoint that APIHub forwards requests to internally. Consumers should not call this URL directly unless explicitly instructed by the provider.</Typography><Box sx={{ mt: 2 }}><CodeBlock language="text" title="Provider base endpoint" code={doc.baseEndpoint} /></Box></Box>}

                  {has.headers && <Box id="headers" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Headers</Typography>
                    <Box sx={{ mt: 1 }}>
                      <CodeBlock language="text" title="Required headers" code={`X-API-Key: YOUR_API_KEY_HERE${doc.headers ? `\n${doc.headers}` : ''}`} />
                    </Box>
                  </Box>}

                  {has.request && <Box id="request" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Request example</Typography><Box sx={{ mt: 1 }}><CodeBlock language="json" title="Request payload" code={doc.requestExample} /></Box></Box>}

                  {has.response && <Box id="response" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Response example</Typography><Box sx={{ mt: 1 }}><CodeBlock language="json" title="Response" code={doc.responseExample} /></Box></Box>}

                  {has.errors && <Box id="errors" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Errors</Typography><Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{doc.errorCodes}</Typography></Box>}

                  {has['rate-limits'] && <Box id="rate-limits" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Rate limits</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{subscription.requestLimit} requests per minute</Typography></Box>}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Drawer anchor="bottom" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ p: 2 }}>
          <Typography fontWeight={700}>Sections</Typography>
          {sections.filter(s => has[s.id]).map((section) => <Button key={section.id} fullWidth sx={{ justifyContent: 'flex-start', mt: 1 }} onClick={() => { document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' }); setDrawerOpen(false); }}>{section.label}</Button>)}
        </Box>
      </Drawer>
    </DashboardLayout>
  );
};

export default DocumentationPage;
