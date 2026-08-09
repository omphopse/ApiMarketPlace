import { Box, Stack, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, action }) => (
  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
    <Stack spacing={0.5}>
      <Typography variant="h4" fontWeight={700} color="text.primary">{title}</Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Stack>
    {action}
  </Box>
);

export default PageHeader;
