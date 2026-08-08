import { Box, Card, Chip, Stack, Typography } from '@mui/material';

const StatCard = ({ label, value, change, accent = 'primary' }) => (
  <Card sx={{ p: 2, height: '100%' }}>
    <Stack spacing={1.5}>
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography variant="h4" fontWeight={700} color="text.primary">
        {value}
      </Typography>
      <Box>
        <Chip label={change} color={accent} size="small" />
      </Box>
    </Stack>
  </Card>
);

export default StatCard;
