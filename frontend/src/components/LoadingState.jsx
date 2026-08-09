import { Box, CircularProgress, Stack, Typography } from '@mui/material';

const LoadingState = ({ title = 'Loading', description = 'Preparing your experience...' }) => (
  <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
    <Stack spacing={2} alignItems="center">
      <CircularProgress />
      <Typography variant="h6" fontWeight={700}>{title}</Typography>
      <Typography color="text.secondary">{description}</Typography>
    </Stack>
  </Box>
);

export default LoadingState;
