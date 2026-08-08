import { Box, Card, Chip, Stack, Typography } from '@mui/material';

const ApiMarketplacePreview = ({ api }) => (
  <Card sx={{ p: 3, bgcolor: 'secondary.main', height: '100%' }}>
    <Typography variant="overline" color="primary" fontWeight={700}>Marketplace preview</Typography>
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box component="img" src={api?.logo || ''} alt={api?.name || 'API'} sx={{ width: 56, height: 56, borderRadius: 16, objectFit: 'cover' }} />
        <Box>
          <Typography variant="h6" fontWeight={700}>{api?.name || 'API Name'}</Typography>
          <Typography color="text.secondary">{api?.shortDescription || 'A polished description will appear here.'}</Typography>
        </Box>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {api?.category && <Chip label={api.category} size="small" color="primary" />}
        {api?.version && <Chip label={api.version} size="small" variant="outlined" />}
      </Stack>
      <Typography color="text.secondary">{api?.fullDescription || 'Share a clear overview of what your API does and why developers will use it.'}</Typography>
      <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Typography fontWeight={700}>Technical snapshot</Typography>
        <Typography variant="body2" color="text.secondary">Base URL: {api?.baseUrl || 'https://api.example.com'}</Typography>
        <Typography variant="body2" color="text.secondary">Authentication: {api?.authType || 'API_KEY'}</Typography>
        <Typography variant="body2" color="text.secondary">Rate limit: {api?.rateLimit || 1000} requests/min</Typography>
      </Box>
    </Stack>
  </Card>
);

export default ApiMarketplacePreview;
