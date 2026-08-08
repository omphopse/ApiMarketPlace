import { Box, Button, Card, Chip, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const ApiMarketplaceCard = ({ api, onClick }) => {
  const startingPlan = api.plans?.[0];
  const isFree = Number(startingPlan?.price || 0) === 0;

  return (
    <Card sx={{ height: '100%', borderRadius: 4, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', boxShadow: 3 } }}>
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box component="img" src={api.logo} alt={api.name} sx={{ width: 48, height: 48, borderRadius: 16, objectFit: 'cover' }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={700}>{api.name}</Typography>
            <Typography variant="body2" color="text.secondary">{api.providerName || 'Northstar Labs'}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap">
          <Chip label={api.category} size="small" color="primary" variant="outlined" />
          <Chip label={`v${api.version}`} size="small" variant="outlined" />
          {isFree && <Chip label="Free" size="small" color="success" variant="outlined" />}
        </Stack>
        <Typography color="text.secondary" sx={{ mt: 2, minHeight: 64 }}>{api.shortDescription}</Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Starting at</Typography>
            <Typography fontWeight={700}>{isFree ? 'Free' : formatCurrency(startingPlan?.price || 0)}</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">{api.subscribers} users</Typography>
        </Stack>
        <Button component={Link} to={`/marketplace/apis/${api.id}`} variant="contained" sx={{ mt: 2 }} onClick={onClick}>View API</Button>
      </Box>
    </Card>
  );
};

export default ApiMarketplaceCard;
