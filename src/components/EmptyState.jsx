import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const EmptyState = ({ title, description, actionLabel, actionTo }) => (
  <Stack spacing={2} alignItems="flex-start" sx={{ py: 4 }}>
    <Typography variant="h6" fontWeight={700}>{title}</Typography>
    <Typography color="text.secondary">{description}</Typography>
    {actionLabel && actionTo && (
      <Button component={Link} to={actionTo} variant="contained">
        {actionLabel}
      </Button>
    )}
  </Stack>
);

export default EmptyState;
