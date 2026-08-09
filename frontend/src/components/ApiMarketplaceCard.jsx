import { Box, Button, Card, Chip, Stack, Typography, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const ApiMarketplaceCard = ({ api, onClick }) => {
  const isFree = Boolean(api.hasFreePlan);

  const initials = api.name ? api.name.split(' ').map((s) => s[0]).slice(0, 2).join('') : 'API';

  return (
    <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', transition: 'transform 0.15s ease, box-shadow 0.15s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: 8 } }}>
      <Box sx={{ p: 2.25, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {api.logoUrl ? (
            <Avatar src={api.logoUrl} alt={api.name} sx={{ width: 56, height: 56, borderRadius: 2 }} />
          ) : (
            <Avatar sx={{ width: 56, height: 56, bgcolor: 'grey.100', color: 'text.primary', fontWeight: 700 }}>{initials}</Avatar>
          )}

          <Box sx={{ minWidth: 0 }}>
            <Typography fontWeight={800} sx={{ fontSize: 16 }}>{api.name}</Typography>
            {api.providerName ? <Typography variant="body2" color="text.secondary">by {api.providerName}</Typography> : null}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" alignItems="center">
          {api.category && <Chip label={api.category} size="small" variant="outlined" />}
          {api.version && <Chip label={`v${api.version}`} size="small" variant="outlined" />}
          {isFree && <Chip label="Free" size="small" color="success" variant="outlined" />}
        </Stack>

        <Typography color="text.secondary" sx={{ mt: 2, minHeight: 56, overflow: 'hidden', textOverflow: 'ellipsis' }}>{api.shortDescription || api.description || 'No description provided.'}</Typography>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 'auto' }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Starting at</Typography>
            <Typography fontWeight={800}>{isFree ? 'Free' : formatCurrency(api.startingPrice)}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button component={Link} to={`/marketplace/apis/${api.id}`} variant="contained" size="small" onClick={onClick}>View API</Button>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
};

export default ApiMarketplaceCard;
