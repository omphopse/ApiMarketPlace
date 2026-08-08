import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Chip, Dialog, Grid, Stack, TextField, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', icon: '📦', status: 'ACTIVE' });

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getCategories();
      setCategories(response || []);
    } catch (err) {
      setError(err.message || 'Unable to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const summary = useMemo(() => ({
    total: categories.length,
    active: categories.filter((category) => category.status === 'ACTIVE').length,
    inactive: categories.filter((category) => category.status === 'INACTIVE').length
  }), [categories]);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    try {
      await adminService.createCategory(form);
      setOpen(false);
      setForm({ name: '', description: '', icon: '📦', status: 'ACTIVE' });
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Unable to create category.');
    }
  };

  const handleDeactivate = async (id) => {
    await adminService.deactivateCategory(id);
    await loadCategories();
  };

  if (loading) return <DashboardLayout role="ADMIN" title="Categories" subtitle="Manage marketplace taxonomy."><LoadingState title="Loading categories" description="Fetching the current category set." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Categories" subtitle="Manage marketplace taxonomy."><ErrorState message={error} retryLabel="Try again" onRetry={loadCategories} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Categories" subtitle="Create, review and deprecate marketplace categories.">
      <PageHeader title="Categories" subtitle="Coordinate taxonomy across provider and consumer flows." action={<Button variant="contained" onClick={() => setOpen(true)}>Create category</Button>} />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: 'Total Categories', value: summary.total },
          { label: 'Active Categories', value: summary.active },
          { label: 'Inactive Categories', value: summary.inactive }
        ].map((item) => <Grid item xs={12} sm={6} md={4} key={item.label}><Card sx={{ p: 2.5, borderRadius: 3 }}><Typography variant="caption" color="text.secondary">{item.label}</Typography><Typography variant="h5" fontWeight={700}>{item.value}</Typography></Card></Grid>)}
      </Grid>
      <AppCard title="Category catalog" subtitle="Update the shared marketplace taxonomy.">
        {categories.length === 0 ? <EmptyState title="No categories yet" description="Create your first category to start organizing APIs." /> : <Stack spacing={2}>{categories.map((category) => <Card key={category.id} sx={{ p: 2.5, borderRadius: 3 }}><Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}><Box><Typography fontWeight={700}>{category.icon} {category.name}</Typography><Typography color="text.secondary">{category.description}</Typography></Box><Stack direction="row" spacing={1} flexWrap="wrap"><Chip label={category.status} /><Chip label={`${category.apiCount || 0} APIs`} /></Stack></Stack>{category.status === 'ACTIVE' && <Button sx={{ mt: 2 }} variant="outlined" onClick={() => handleDeactivate(category.id)}>Deactivate</Button>}</Card>)}</Stack>}
      </AppCard>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>Create Category</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <TextField label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} multiline minRows={3} />
            <TextField label="Icon" value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleCreate}>Create category</Button>
          </Stack>
        </Box>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
