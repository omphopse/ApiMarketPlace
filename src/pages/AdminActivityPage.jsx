import { useEffect, useState } from 'react';
import { Box, Card, Stack, Typography } from '@mui/material';
import DashboardLayout from '../layouts/DashboardLayout';
import PageHeader from '../components/PageHeader';
import AppCard from '../components/AppCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { adminService } from '../services/adminService';

const AdminActivityPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadActivities = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await adminService.getActivities();
      setActivities(response || []);
    } catch (err) {
      setError(err.message || 'Unable to load activity feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadActivities(); }, []);

  if (loading) return <DashboardLayout role="ADMIN" title="Activity" subtitle="Platform history and moderation log."><LoadingState title="Loading activity" description="Fetching the admin timeline." /></DashboardLayout>;
  if (error) return <DashboardLayout role="ADMIN" title="Activity" subtitle="Platform history and moderation log."><ErrorState message={error} retryLabel="Try again" onRetry={loadActivities} /></DashboardLayout>;

  return (
    <DashboardLayout role="ADMIN" title="Activity" subtitle="Track important marketplace actions across roles.">
      <PageHeader title="Platform activity" subtitle="Audit the shared mock ecosystem." />
      <Stack spacing={2}>
        {activities.map((activity) => (
          <Card key={activity.id} sx={{ p: 3, borderRadius: 3 }}>
            <Typography fontWeight={700}>{activity.action}</Typography>
            <Typography color="text.secondary">{activity.details}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>{activity.actor?.name || 'System'} • {new Date(activity.timestamp).toLocaleString()}</Typography>
          </Card>
        ))}
      </Stack>
    </DashboardLayout>
  );
};

export default AdminActivityPage;
