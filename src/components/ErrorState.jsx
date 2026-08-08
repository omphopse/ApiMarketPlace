import { Alert, Button, Stack } from '@mui/material';

const ErrorState = ({ message = 'Something went wrong', retryLabel = 'Try again', onRetry }) => (
  <Stack spacing={2} sx={{ py: 4 }}>
    <Alert severity="error">{message}</Alert>
    {onRetry && (
      <Button variant="contained" onClick={onRetry} sx={{ alignSelf: 'flex-start' }}>
        {retryLabel}
      </Button>
    )}
  </Stack>
);

export default ErrorState;
