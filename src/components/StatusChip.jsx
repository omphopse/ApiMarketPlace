import { Chip } from '@mui/material';

const statusMap = {
  Published: 'success',
  Pending: 'warning',
  Rejected: 'error',
  Draft: 'default',
  Active: 'success',
  Expiring: 'warning',
  Review: 'warning'
};

const StatusChip = ({ label }) => <Chip label={label} color={statusMap[label] || 'default'} size="small" />;

export default StatusChip;
