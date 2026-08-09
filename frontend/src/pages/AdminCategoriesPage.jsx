import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, Dialog, Drawer, Grid, IconButton, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { toast } from 'react-toastify';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import { adminService } from '../services/adminService';

const AdminCategoriesPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [openForm, setOpenForm] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });

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

  useEffect(() => {
    loadCategories();
  }, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    if (!search.trim()) {
      return sortedCategories;
    }
    const keyword = search.trim().toLowerCase();
    return sortedCategories.filter((category) => {
      const name = String(category.name || '').toLowerCase();
      const description = String(category.description || '').toLowerCase();
      const id = String(category.id || '').toLowerCase();
      return name.includes(keyword) || description.includes(keyword) || id.includes(keyword);
    });
  }, [search, sortedCategories]);

  const summary = useMemo(() => ({
    total: categories.length
  }), [categories]);

  const openCreateForm = () => {
    setEditingCategory(null);
    setForm({ name: '', description: '' });
    setOpenForm(true);
  };

  const openEditForm = (category) => {
    setEditingCategory(category);
    setForm({ name: category.name || '', description: category.description || '' });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setEditingCategory(null);
  };

  const handleSaveCategory = async () => {
    if (!form.name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.id, {
          name: form.name.trim(),
          description: form.description.trim()
        });
        toast.success('Category updated');
      } else {
        await adminService.createCategory({
          name: form.name.trim(),
          description: form.description.trim()
        });
        toast.success('Category created');
      }
      closeForm();
      await loadCategories();
    } catch (err) {
      toast.error(err.message || 'Unable to save category.');
    }
  };

  const openCategoryDrawer = async (categoryId) => {
    setOpenDrawer(true);
    setDetailLoading(true);
    setDetailError('');
    try {
      const result = await adminService.getCategoryById(categoryId);
      setSelectedCategory(result);
    } catch (err) {
      setDetailError(err.message || 'Unable to load category details.');
      setSelectedCategory(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setOpenDrawer(false);
    setSelectedCategory(null);
    setDetailError('');
  };

  const promptDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) {
      return;
    }

    try {
      await adminService.deactivateCategory(categoryToDelete.id);
      toast.success('Category deleted');
      setConfirmDeleteOpen(false);
      setCategoryToDelete(null);
      await loadCategories();
      if (selectedCategory?.id === categoryToDelete.id) {
        closeDrawer();
      }
    } catch (err) {
      toast.error(err.message || 'Unable to delete category.');
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN" title="Categories" subtitle="Manage the categories used to organize APIs across the marketplace.">
        <LoadingState title="Loading categories" description="Fetching category data." />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="ADMIN" title="Categories" subtitle="Manage the categories used to organize APIs across the marketplace.">
        <ErrorState message={error} retryLabel="Try again" onRetry={loadCategories} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN" title="Categories" subtitle="Manage the categories used to organize APIs across the marketplace.">
      <PageHeader
        title="Categories"
        subtitle="Manage the categories used to organize APIs across the marketplace."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={openCreateForm}>Create category</Button>
            <Button variant="outlined" onClick={loadCategories}>Refresh</Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="caption" color="text.secondary">Total categories</Typography>
            <Typography variant="h5" fontWeight={700}>{summary.total}</Typography>
          </Card>
        </Grid>
      </Grid>

      <AppCard title="Category directory" subtitle="Search and manage marketplace categories.">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
          <TextField
            label="Search categories"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            size="small"
          />
          {search.trim() && (
            <Button variant="outlined" onClick={() => setSearch('')}>Clear</Button>
          )}
        </Stack>

        {filteredCategories.length === 0 ? (
          <EmptyState
            title={search.trim() ? 'No matching categories' : 'No categories yet'}
            description={search.trim() ? 'Try another search or clear the filter.' : 'Create your first category to start organizing APIs.'}
          />
        ) : isMobile ? (
          <Stack spacing={2}>
            {filteredCategories.map((category) => (
              <Paper key={category.id} sx={{ p: 2, borderRadius: 3 }}>
                <Stack spacing={1}>
                  <Typography fontWeight={700}>{category.name}</Typography>
                  {category.description ? (
                    <Typography color="text.secondary">{category.description}</Typography>
                  ) : (
                    <Typography color="text.secondary">—</Typography>
                  )}
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="outlined" onClick={() => openCategoryDrawer(category.id)}>View</Button>
                    <Button size="small" variant="outlined" onClick={() => openEditForm(category)}>Edit</Button>
                    <Button size="small" color="error" variant="outlined" onClick={() => promptDeleteCategory(category)}>Delete</Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{category.name}</Typography>
                      <Typography color="text.secondary" variant="body2">{category.id}</Typography>
                    </TableCell>
                    <TableCell>
                      {category.description ? category.description : <Typography color="text.secondary">—</Typography>}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                        <Button size="small" variant="outlined" onClick={() => openCategoryDrawer(category.id)}>View</Button>
                        <Button size="small" variant="outlined" onClick={() => openEditForm(category)}>Edit</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => promptDeleteCategory(category)}>Delete</Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AppCard>

      <Drawer
        anchor="right"
        open={openDrawer}
        onClose={closeDrawer}
        PaperProps={{ sx: { width: { xs: '100%', sm: 520 }, maxWidth: '100%' } }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6">Category details</Typography>
              <Typography color="text.secondary">Review category information.</Typography>
            </Box>
            <IconButton onClick={closeDrawer}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {detailLoading ? (
            <LoadingState title="Loading category" description="Fetching details." />
          ) : detailError ? (
            <ErrorState message={detailError} retryLabel="Try again" onRetry={() => selectedCategory && openCategoryDrawer(selectedCategory.id)} />
          ) : selectedCategory ? (
            <Stack spacing={3}>
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700}>{selectedCategory.name}</Typography>
                {selectedCategory.description ? (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>{selectedCategory.description}</Typography>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>No description provided.</Typography>
                )}
              </Card>
              <Card sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">Category ID</Typography>
                  <Typography>{selectedCategory.id}</Typography>
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Typography color="text.secondary">Select a category to view details.</Typography>
          )}
        </Box>
      </Drawer>

      <Dialog open={openForm} onClose={closeForm} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>{editingCategory ? 'Edit category' : 'Create category'}</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Category name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              multiline
              minRows={3}
            />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button onClick={closeForm}>Cancel</Button>
            <Button variant="contained" onClick={handleSaveCategory}>{editingCategory ? 'Save changes' : 'Create category'}</Button>
          </Stack>
        </Box>
      </Dialog>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete category?"
        description="This action will remove the category from the marketplace."
        confirmLabel="Delete"
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={handleDeleteCategory}
      />
    </DashboardLayout>
  );
};

export default AdminCategoriesPage;
