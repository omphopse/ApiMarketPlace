import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Container, Divider, Grid, LinearProgress, MenuItem, Stack, Step, StepLabel, Stepper, TextField, Typography, InputAdornment } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import ApiMarketplacePreview from '../components/ApiMarketplacePreview';
import { providerService } from '../services/providerService';
import { toast } from 'react-toastify';
import { formatCurrency } from '../utils/formatters';
import ConfirmDialog from '../components/ConfirmDialog';

const steps = ['Basic Information', 'Technical Configuration', 'Subscription Plans', 'Documentation', 'Review & Submit'];

const defaultDraft = {
  name: '',
  shortDescription: '',
  fullDescription: '',
  category: '',
  categoryId: '',
  version: '1.0',
  logo: '',
  tags: ['weather', 'api'],
  baseUrl: '',
  authType: 'API_KEY',
  rateLimit: 1000,
  timeout: 30,
  supportUrl: '',
  plans: [],
  documentation: {
    authGuide: '',
    baseEndpoint: '',
    headers: '',
    requestExample: '',
    responseExample: '',
    errorCodes: '',
    markdown: ''
  }
};

const ProviderCreateApiPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [draft, setDraft] = useState(defaultDraft);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [planDraft, setPlanDraft] = useState({ name: '', price: 0, billingCycle: 'FREE', requestLimit: 100, description: '', status: 'ACTIVE' });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [categories, setCategories] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    const loadDraft = async () => {
      const existingDraft = await providerService.getDraft();
      if (existingDraft) {
        setDraft(existingDraft);
      }
      setLoading(false);
    };
    loadDraft();
    providerService.getCategories()
      .then((list) => {
        setCategories(list);
        setDraft((prev) => {
          if (prev.categoryId || list.length === 0) return prev;
          return { ...prev, categoryId: list[0].id, category: list[0].name };
        });
      })
      .catch((err) => toast.error(err.message || 'Unable to load categories.'));
  }, []);

  // Validation helpers
  const setFieldError = (path, message) => setErrors((prev) => ({ ...prev, [path]: message }));
  const clearFieldError = (path) => setErrors((prev) => { const next = { ...prev }; delete next[path]; return next; });

  const validateStep = (step) => {
    const stepErrors = {};
    // Step 0: Basic Information
    if (step === 0) {
      const name = String(draft.name || '').trim();
      if (!name) stepErrors['name'] = 'API name is required.';
      else if (name.length < 3) stepErrors['name'] = 'API name must be at least 3 characters.';
      else if (name.length > 60) stepErrors['name'] = 'API name must be 60 characters or fewer.';

      const shortDesc = String(draft.shortDescription || '').trim();
      if (!shortDesc) stepErrors['shortDescription'] = 'Short description is required.';
      else if (shortDesc.length > 160) stepErrors['shortDescription'] = 'Short description must be 160 characters or fewer.';

      const fullDesc = String(draft.fullDescription || '').trim();
      if (!fullDesc) stepErrors['fullDescription'] = 'Full description is required.';

      if (!draft.categoryId) stepErrors['categoryId'] = 'Category is required.';

      const version = String(draft.version || '').trim();
      if (!version) stepErrors['version'] = 'Version is required.';
    }

    // Step 1: Technical
    if (step === 1) {
      const base = String(draft.baseUrl || '').trim();
      if (!base) stepErrors['baseUrl'] = 'Base URL is required.';
      else {
        try { const u = new URL(/^https?:\/\//i.test(base) ? base : `https://${base}`); if (!u.hostname) throw new Error(); } catch { stepErrors['baseUrl'] = 'Enter a valid Base URL, e.g. https://api.example.com'; }
      }
      if (!draft.authType) stepErrors['authType'] = 'Authentication type is required.';
      if (draft.rateLimit == null || Number.isNaN(Number(draft.rateLimit)) || Number(draft.rateLimit) <= 0) stepErrors['rateLimit'] = 'Rate limit must be a positive number.';
      if (draft.timeout == null || Number.isNaN(Number(draft.timeout)) || Number(draft.timeout) <= 0) stepErrors['timeout'] = 'Timeout must be a positive number.';
      if (draft.supportUrl && (() => { try { const u = new URL(draft.supportUrl); return false; } catch { return true; } })()) stepErrors['supportUrl'] = 'Enter a valid support URL.';
    }

    // Step 2: Plans
    if (step === 2) {
      if (!Array.isArray(draft.plans) || draft.plans.length === 0) {
        stepErrors['plans'] = 'At least one subscription plan is required.';
      } else {
        const names = new Set();
        draft.plans.forEach((p, idx) => {
          const keyBase = `plans[${idx}]`;
          const name = String(p.name || '').trim();
          if (!name) stepErrors[`${keyBase}.name`] = 'Plan name is required.';
          if (names.has(name)) stepErrors[`${keyBase}.name`] = 'Duplicate plan name.';
          names.add(name);
          if (p.price == null || Number.isNaN(Number(p.price)) || Number(p.price) < 0) stepErrors[`${keyBase}.price`] = 'Price must be 0 or greater.';
          if (p.requestLimit == null || Number.isNaN(Number(p.requestLimit)) || Number(p.requestLimit) <= 0) stepErrors[`${keyBase}.requestLimit`] = 'Request limit must be a positive number.';
        });
      }
    }

    // Step 3: Documentation
    if (step === 3) {
      // If request/response examples are provided, ensure JSON validity when they look like JSON (start with { or [)
      const reqExample = String(draft.documentation.requestExample || '').trim();
      if (reqExample && (/^[\[{]/.test(reqExample))) {
        try { JSON.parse(reqExample); } catch (e) { stepErrors['documentation.requestExample'] = `Invalid JSON: ${e.message}`; }
      }
      const resExample = String(draft.documentation.responseExample || '').trim();
      if (resExample && (/^[\[{]/.test(resExample))) {
        try { JSON.parse(resExample); } catch (e) { stepErrors['documentation.responseExample'] = `Invalid JSON: ${e.message}`; }
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const completion = useMemo(() => Math.round(((activeStep + 1) / steps.length) * 100), [activeStep]);

  const persistDraft = async (nextDraft) => {
    const value = nextDraft || draft;
    setDraft(value);
    await providerService.saveDraft(value);
  };

  const handleNext = async () => {
    if (activeStep === steps.length - 1) return;
    // Validate current step before allowing next
    const ok = validateStep(activeStep);
    if (!ok) {
      // focus will be handled by the field-level components via errors state
      return;
    }
    if (activeStep === 2 && planDraft.name.trim() && draft.plans.length === 0) {
      const nextDraft = {
        ...draft,
        plans: [{
          ...planDraft,
          name: planDraft.name.trim(),
          id: `plan-${Date.now()}`
        }]
      };
      setDraft(nextDraft);
      await persistDraft(nextDraft);
      setPlanDraft({ name: '', price: 0, billingCycle: 'FREE', requestLimit: 100, description: '', status: 'ACTIVE' });
      setActiveStep(activeStep + 1);
      return;
    }
    const nextStep = activeStep + 1;
    setActiveStep(nextStep);
    await persistDraft();
  };

  const handleBack = async () => {
    const nextStep = Math.max(0, activeStep - 1);
    setActiveStep(nextStep);
    await persistDraft();
  };

  const handleSaveDraft = async () => {
    await persistDraft();
    toast.success('Draft saved locally.');
  };

  const handleSubmit = async () => {
    // Re-validate all steps before final submit
    for (let s = 0; s < steps.length - 1; s += 1) {
      const ok = validateStep(s);
      if (!ok) {
        setActiveStep(s);
        toast.error('Please fix errors before submitting.');
        setConfirmOpen(false);
        return;
      }
    }

    // Prepare payload with normalized base URL
    const baseUrl = String(draft.baseUrl || '').trim();
    const normalizedBaseUrl = /^https?:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`;
    const payload = {
      ...draft,
      baseUrl: normalizedBaseUrl,
      logo: draft.logo?.startsWith('data:') || draft.logo?.length > 255 ? '' : draft.logo,
      status: 'PENDING'
    };

    try {
      // disable submit UI by setting confirmOpen false and optionally could set a submitting flag
      setConfirmOpen(false);
      const created = await providerService.createApi(payload);
      await providerService.submitApi(created.id);
      toast.success('API submitted for approval.');
      navigate(`/provider/apis/${created.id}`);
    } catch (error) {
      // Map backend field errors if available
      if (error && error.payload && typeof error.payload === 'object' && error.payload.details) {
        // expected structure: { message, details: { field: message } }
        const details = error.payload.details;
        setErrors((prev) => ({ ...prev, ...details }));
        // focus first error step if possible
        const keys = Object.keys(details);
        if (keys.length) {
          const field = keys[0];
          if (field.startsWith('plans')) setActiveStep(2);
          else if (field.startsWith('documentation')) setActiveStep(3);
          else setActiveStep(0);
        }
        toast.error(error.message || 'Validation errors returned from server.');
        return;
      }
      toast.error(error.message || 'Unable to submit API for approval.');
    }
  };

  const handlePlanAdd = async () => {
    const nextPlans = [...draft.plans, { ...planDraft, id: `plan-${Date.now()}` }];
    const nextDraft = { ...draft, plans: nextPlans };
    setDraft(nextDraft);
    await providerService.saveDraft(nextDraft);
    setPlanDraft({ name: '', price: 0, billingCycle: 'FREE', requestLimit: 100, description: '', status: 'ACTIVE' });
  };

  const handlePlanDelete = async (planId) => {
    const nextDraft = { ...draft, plans: draft.plans.filter((plan) => plan.id !== planId) };
    setDraft(nextDraft);
    await providerService.saveDraft(nextDraft);
  };

  const handleLogoSelect = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError('');
      const uploadedUrl = await providerService.uploadLogo(file);
      const nextDraft = { ...draft, logo: uploadedUrl };
      setDraft(nextDraft);
      setLogoFile(file.name);
      await providerService.saveDraft(nextDraft);
    } catch (error) {
      setUploadError(error.message || 'Unable to upload logo.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <DashboardLayout role="PROVIDER" title="Create API" subtitle="Prepare your marketplace listing."><Box sx={{ p: 4 }}><Typography>Loading draft…</Typography></Box></DashboardLayout>;
  }

  return (
    <DashboardLayout role="PROVIDER" title="Create API" subtitle="Publish a polished product experience.">
      <PageHeader title="Create New API" subtitle="Complete the following steps to publish your API." action={<><Button onClick={handleSaveDraft} variant="outlined">Save Draft</Button><Button component={Link} to="/provider/apis" variant="text">Exit</Button></>} />
      <Card sx={{ p: { xs: 2, md: 3 }, mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>Step {activeStep + 1} of {steps.length}</Typography>
            <Typography color="text.secondary">{steps[activeStep]}</Typography>
          </Box>
          <Box sx={{ width: { xs: '100%', md: 260 } }}>
            <Typography variant="caption" color="text.secondary">Completion</Typography>
            <LinearProgress variant="determinate" value={completion} sx={{ mt: 1, height: 8, borderRadius: 999 }} />
          </Box>
        </Stack>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mt: 3, display: { xs: 'none', md: 'flex' } }}>
          {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
        </Stepper>
      </Card>
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <AppCard title={steps[activeStep]} subtitle="Provide the information needed for a polished marketplace listing.">
            {activeStep === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Stack spacing={2}>
                    <TextField
                      label="API Name"
                      required
                      value={draft.name}
                      onChange={(event) => { setDraft({ ...draft, name: event.target.value }); clearFieldError('name'); }}
                      inputProps={{ maxLength: 60 }}
                      helperText={errors.name ? errors.name : `${draft.name.length}/60`}
                      error={Boolean(errors.name)}
                    />
                    <TextField
                      label="Short Description"
                      value={draft.shortDescription}
                      onChange={(event) => { setDraft({ ...draft, shortDescription: event.target.value }); clearFieldError('shortDescription'); }}
                      inputProps={{ maxLength: 160 }}
                      helperText={errors.shortDescription ? errors.shortDescription : `${draft.shortDescription.length}/160`}
                      error={Boolean(errors.shortDescription)}
                      multiline
                      minRows={2}
                    />
                    <TextField
                      label="Full Description"
                      value={draft.fullDescription}
                      onChange={(event) => { setDraft({ ...draft, fullDescription: event.target.value }); clearFieldError('fullDescription'); }}
                      helperText={errors.fullDescription}
                      error={Boolean(errors.fullDescription)}
                      multiline
                      minRows={4}
                    />
                    <TextField
                      select
                      label="Category"
                      value={draft.categoryId}
                      onChange={(event) => {
                        const selectedCategory = categories.find((category) => category.id === event.target.value);
                        setDraft({ ...draft, categoryId: event.target.value, category: selectedCategory?.name || '' });
                        clearFieldError('categoryId');
                      }}
                      helperText={errors.categoryId}
                      error={Boolean(errors.categoryId)}
                    >
                      {categories.map((category) => <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>)}
                    </TextField>
                    <TextField label="Version" value={draft.version} onChange={(event) => { setDraft({ ...draft, version: event.target.value }); clearFieldError('version'); }} helperText={errors.version} error={Boolean(errors.version)} />
                    <TextField label="Tags" value={draft.tags.join(', ')} onChange={(event) => setDraft({ ...draft, tags: event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean) })} />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); handleLogoSelect({ target: { files: event.dataTransfer.files } }); }} sx={{ p: 3, border: '2px dashed', borderColor: dragActive ? 'primary.main' : 'divider', borderRadius: 4, textAlign: 'center', bgcolor: 'secondary.main' }}>
                    <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleLogoSelect} style={{ display: 'block', margin: '0 auto' }} />
                    <Typography fontWeight={700}>API Logo</Typography>
                    <Typography color="text.secondary" sx={{ mt: 1 }}>Drag and drop a PNG or JPG, or browse to upload.</Typography>
                    {uploadError && <Typography color="error" sx={{ mt: 1 }}>{uploadError}</Typography>}
                    {draft.logo && <Box component="img" src={draft.logo} alt="Logo preview" sx={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', mt: 2 }} />}
                    {logoFile && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{uploading ? 'Uploading...' : logoFile}</Typography>}
                  </Box>
                </Grid>
              </Grid>
            )}
            {activeStep === 1 && (
              <Stack spacing={2}>
                <TextField
                  label="Base URL"
                  value={draft.baseUrl}
                  onChange={(event) => { setDraft({ ...draft, baseUrl: event.target.value }); clearFieldError('baseUrl'); }}
                  placeholder="https://api.example.com/v1"
                  helperText={errors.baseUrl}
                  error={Boolean(errors.baseUrl)}
                />
                <TextField
                  select
                  label="Authentication Type"
                  value={draft.authType}
                  onChange={(event) => { setDraft({ ...draft, authType: event.target.value }); clearFieldError('authType'); }}
                  helperText={errors.authType}
                  error={Boolean(errors.authType)}
                >
                  {['API_KEY', 'BEARER_TOKEN', 'BASIC_AUTH', 'OAUTH2', 'NONE'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
                <TextField
                  label="Rate Limit"
                  type="number"
                  value={draft.rateLimit}
                  onChange={(event) => { setDraft({ ...draft, rateLimit: Number(event.target.value) }); clearFieldError('rateLimit'); }}
                  InputProps={{ endAdornment: <InputAdornment position="end">req/min</InputAdornment> }}
                  helperText={errors.rateLimit}
                  error={Boolean(errors.rateLimit)}
                />
                <TextField
                  label="Timeout"
                  type="number"
                  value={draft.timeout}
                  onChange={(event) => { setDraft({ ...draft, timeout: Number(event.target.value) }); clearFieldError('timeout'); }}
                  InputProps={{ endAdornment: <InputAdornment position="end">seconds</InputAdornment> }}
                  helperText={errors.timeout}
                  error={Boolean(errors.timeout)}
                />
                <TextField
                  label="Support URL"
                  value={draft.supportUrl}
                  onChange={(event) => { setDraft({ ...draft, supportUrl: event.target.value }); clearFieldError('supportUrl'); }}
                  placeholder="https://support.example.com"
                  helperText={errors.supportUrl}
                  error={Boolean(errors.supportUrl)}
                />
              </Stack>
            )}
            {activeStep === 2 && (
              <Box>
                {draft.plans.length === 0 ? <Typography color="text.secondary">No subscription plans created yet.</Typography> : <Stack spacing={2}>{draft.plans.map((plan) => <Card key={plan.id} sx={{ p: 2.5 }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}><Box><Typography fontWeight={700}>{plan.name}</Typography><Typography color="text.secondary">{plan.description}</Typography></Box><Box><Typography variant="h6">{formatCurrency(plan.price)}</Typography><Typography variant="caption" color="text.secondary">{plan.billingCycle}</Typography></Box><Button color="error" onClick={() => handlePlanDelete(plan.id)}>Delete</Button></Stack></Card>)}</Stack>}
                <Divider sx={{ my: 3 }} />
                <Stack spacing={2}>
                  <TextField label="Plan Name" value={planDraft.name} onChange={(event) => setPlanDraft({ ...planDraft, name: event.target.value })} />
                  <TextField label="Price" type="number" value={planDraft.price} onChange={(event) => setPlanDraft({ ...planDraft, price: Number(event.target.value) })} />
                  <TextField select label="Billing Cycle" value={planDraft.billingCycle} onChange={(event) => setPlanDraft({ ...planDraft, billingCycle: event.target.value })}>
                    {['FREE', 'MONTHLY', 'QUARTERLY', 'YEARLY'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                  </TextField>
                  <TextField label="Request Limit" type="number" value={planDraft.requestLimit} onChange={(event) => setPlanDraft({ ...planDraft, requestLimit: Number(event.target.value) })} />
                  <TextField label="Description" value={planDraft.description} onChange={(event) => setPlanDraft({ ...planDraft, description: event.target.value })} multiline minRows={2} />
                  <Button variant="contained" sx={{ alignSelf: 'flex-start' }} onClick={handlePlanAdd}>+ Add Plan</Button>
                </Stack>
              </Box>
            )}
            {activeStep === 3 && (
              <Stack spacing={2}>
                <TextField label="Authentication Guide" value={draft.documentation.authGuide} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, authGuide: event.target.value } })} multiline minRows={2} />
                <TextField label="Base Endpoint" value={draft.documentation.baseEndpoint} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, baseEndpoint: event.target.value } })} />
                <TextField label="Headers" value={draft.documentation.headers} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, headers: event.target.value } })} multiline minRows={2} />
                <TextField label="Request Example" value={draft.documentation.requestExample} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, requestExample: event.target.value } })} multiline minRows={3} />
                <TextField label="Response Example" value={draft.documentation.responseExample} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, responseExample: event.target.value } })} multiline minRows={3} />
                <TextField label="Error Codes" value={draft.documentation.errorCodes} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, errorCodes: event.target.value } })} />
                <TextField label="Markdown Documentation" value={draft.documentation.markdown} onChange={(event) => setDraft({ ...draft, documentation: { ...draft.documentation, markdown: event.target.value } })} multiline minRows={6} />
              </Stack>
            )}
            {activeStep === 4 && (
              <Stack spacing={3}>
                <Card sx={{ p: 3 }}>
                  <Typography fontWeight={700}>Validation summary</Typography>
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography>✓ Basic Information Complete</Typography>
                    <Typography>✓ Technical Configuration Complete</Typography>
                    <Typography>{draft.plans.length > 0 ? '✓ Subscription Plan Added' : '⚠ Subscription Plan Added'}</Typography>
                    <Typography>{draft.documentation.markdown ? '✓ Documentation Added' : '⚠ Documentation Added'}</Typography>
                  </Stack>
                </Card>
                <ApiMarketplacePreview api={draft} />
              </Stack>
            )}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 3 }}>
              <Button variant="outlined" onClick={handleBack} disabled={activeStep === 0}>Back</Button>
              {activeStep < steps.length - 1 ? <Button variant="contained" onClick={handleNext}>Next</Button> : <Button variant="contained" onClick={() => setConfirmOpen(true)}>Submit for Approval</Button>}
            </Stack>
          </AppCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <ApiMarketplacePreview api={draft} />
        </Grid>
      </Grid>
      <ConfirmDialog open={confirmOpen} title="Submit API for review?" description="Once submitted, your API will move to pending review." confirmLabel="Submit API" onClose={() => setConfirmOpen(false)} onConfirm={handleSubmit} />
    </DashboardLayout>
  );
};

export default ProviderCreateApiPage;
