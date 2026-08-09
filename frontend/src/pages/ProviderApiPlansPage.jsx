import { useEffect, useState } from 'react';
import { Alert, Box, Button, Card, Dialog, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { providerService } from '../services/providerService';
import { formatCurrency } from '../utils/formatters';

const emptyPlan = { planName: '', price: 0, billingCycle: 'MONTHLY', requestLimit: 1, active: true };

const ProviderApiPlansPage = () => {
  const { id } = useParams();
  const [plans, setPlans] = useState(null);
  const [form, setForm] = useState(emptyPlan);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setError(''); setPlans(await providerService.getPlans(id)); } catch (err) { setError(err.message || 'Unable to load plans.'); }
  };
  useEffect(() => { load(); }, [id]);

  const save = async () => {
    try {
      setSaving(true);
      if (editingId) await providerService.updatePlan(editingId, form);
      else await providerService.createPlan(id, form);
      setForm(emptyPlan); setEditingId(null); await load();
    } catch (err) { setError(err.message || 'Unable to save plan.'); } finally { setSaving(false); }
  };
  const remove = async (planId) => { try { await providerService.deletePlan(planId); await load(); } catch (err) { setError(err.message || 'Unable to delete plan.'); } };

  if (error && !plans) return <DashboardLayout role="PROVIDER" title="Plans"><ErrorState message={error} retryLabel="Try again" onRetry={load} /></DashboardLayout>;
  if (!plans) return <DashboardLayout role="PROVIDER" title="Plans"><LoadingState title="Loading plans" /></DashboardLayout>;

  return <DashboardLayout role="PROVIDER" title="API plans" subtitle="Manage subscription plans through the provider API.">
    <PageHeader title="Plans" subtitle={`API ${id}`} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Card sx={{ p: 2.5, mb: 3, borderRadius: 2 }}><Typography variant="h6" fontWeight={700}>{editingId ? 'Edit plan' : 'Create plan'}</Typography><Stack spacing={2} sx={{ mt: 2 }}><TextField label="Plan name" value={form.planName} onChange={(e) => setForm({ ...form, planName: e.target.value })} /><TextField label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /><TextField select label="Billing cycle" value={form.billingCycle} onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}><MenuItem value="MONTHLY">Monthly</MenuItem><MenuItem value="YEARLY">Yearly</MenuItem><MenuItem value="FREE">Free</MenuItem></TextField><TextField label="Request limit" type="number" value={form.requestLimit} onChange={(e) => setForm({ ...form, requestLimit: e.target.value })} /><Stack direction="row" spacing={1}><Button variant="contained" onClick={save} disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update plan' : 'Create plan'}</Button>{editingId && <Button onClick={() => { setEditingId(null); setForm(emptyPlan); }}>Cancel</Button>}</Stack></Stack></Card>
    {!plans.length ? <EmptyState title="No plans" description="Create the first plan for this API." /> : <Stack spacing={2}>{plans.map((plan) => <Card key={plan.id} sx={{ p: 2.5, borderRadius: 2 }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}><Box><Typography fontWeight={700}>{plan.planName || 'Unnamed plan'}</Typography><Typography color="text.secondary">{formatCurrency(plan.price)} · {plan.billingCycle} · {plan.requestLimit} requests</Typography></Box><Stack direction="row" spacing={1}><Button onClick={() => { setEditingId(plan.id); setForm({ planName: plan.planName || '', price: plan.price || 0, billingCycle: plan.billingCycle || 'MONTHLY', requestLimit: plan.requestLimit || 1, active: plan.active }); }}>Edit</Button><Button color="error" onClick={() => remove(plan.id)}>Delete</Button></Stack></Stack></Card>)}</Stack>}
  </DashboardLayout>;
};

export default ProviderApiPlansPage;
