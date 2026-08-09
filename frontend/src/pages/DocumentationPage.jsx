import { useEffect, useState } from 'react';
import { Box, Button, Drawer, List, ListItemButton, ListItemText, Stack, Typography, Grid, Paper, IconButton, MenuItem, Select, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
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
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const theme = useTheme();

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

  // Helper to check availability of sections
  const has = {
    overview: Boolean(doc.markdown),
    authentication: Boolean(doc.authenticationGuide),
    'base-url': Boolean(doc.baseEndpoint),
    headers: Boolean(doc.headers),
    endpoints: Array.isArray(doc.endpoints) && doc.endpoints.length > 0,
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
                  {has.overview && <Box id="overview" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Overview</Typography><Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{doc.markdown}</Typography></Box>}

                  {has.authentication && <Box id="authentication" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Authentication</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{doc.authenticationGuide}</Typography></Box>}

                  {has['base-url'] && <Box id="base-url" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Base URL</Typography><Box sx={{ mt: 1 }}><CodeBlock language="text" title="Base URL" code={doc.baseEndpoint} /></Box></Box>}

                  {has.headers && <Box id="headers" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Headers</Typography>{typeof doc.headers === 'string' ? <Box sx={{ mt: 1 }}><CodeBlock language="text" title="Headers" code={doc.headers} /></Box> : null}</Box>}

                  {has.endpoints && <Box id="endpoints" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Endpoints</Typography>
                    <Box sx={{ mt: 2 }}>
                      {doc.endpoints.map((ep, idx) => (
                        <Paper key={idx} variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ px: 1, py: 0.5, bgcolor: (ep.method === 'GET' ? 'success.light' : ep.method === 'POST' ? 'primary.light' : 'warning.light'), borderRadius: 0.5, fontWeight: 700 }}>{ep.method}</Box>
                            <Typography fontFamily="monospace">{ep.path}</Typography>
                            <Box sx={{ ml: 'auto' }}>
                              {ep.example && <Button variant="text" size="small" onClick={() => navigator.clipboard.writeText(ep.example)}>Copy</Button>}
                            </Box>
                          </Box>
                          {ep.description && <Typography color="text.secondary" sx={{ mt: 1 }}>{ep.description}</Typography>}
                          {ep.parameters && ep.parameters.length > 0 && (
                            <Box sx={{ mt: 1 }}>
                              <Typography variant="subtitle2">Parameters</Typography>
                              <Box component="table" sx={{ width: '100%', mt: 1, borderCollapse: 'collapse', fontSize: 13 }}>
                                <thead>
                                  <tr><th style={{ textAlign: 'left', padding: 6 }}>Name</th><th style={{ textAlign: 'left', padding: 6 }}>Type</th><th style={{ textAlign: 'left', padding: 6 }}>Required</th></tr>
                                </thead>
                                <tbody>
                                  {ep.parameters.map((p, i) => (
                                    <tr key={i}><td style={{ padding: 6 }}>{p.name}</td><td style={{ padding: 6 }}>{p.type}</td><td style={{ padding: 6 }}>{p.required ? 'Yes' : 'No'}</td></tr>
                                  ))}
                                </tbody>
                              </Box>
                            </Box>
                          )}
                          {ep.response && <Box sx={{ mt: 2 }}><Typography variant="subtitle2">Response</Typography><Box sx={{ mt: 1 }}><CodeBlock language="json" title="Response" code={ep.response} /></Box></Box>}
                        </Paper>
                      ))}
                    </Box>
                  </Box>}

                  {has.response && <Box id="response" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Response Example</Typography><Box sx={{ mt: 1 }}><CodeBlock language="json" title="Response" code={doc.responseExample} /></Box></Box>}

                  {has.errors && <Box id="errors" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Errors</Typography><Typography color="text.secondary" sx={{ mt: 1, whiteSpace: 'pre-line' }}>{doc.errorCodes}</Typography></Box>}

                  {has['rate-limits'] && <Box id="rate-limits" sx={{ mb: 6 }}><Typography variant="h6" fontWeight={700}>Rate Limits</Typography><Typography color="text.secondary" sx={{ mt: 1 }}>{subscription.requestLimit} requests per minute</Typography></Box>}
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
