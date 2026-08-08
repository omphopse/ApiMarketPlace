import { Button, Card, Stack, Typography } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ComingSoonPage = ({ title, description, plannedFeatures, backPath }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Card sx={{ p: { xs: 3, md: 5 }, textAlign: 'left' }}>
      <Stack spacing={2.5}>
        <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.16em' }}>
          Module placeholder
        </Typography>
        <Typography variant="h4" fontWeight={700}>{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
        <Stack component="ul" spacing={1} sx={{ pl: 3 }}>
          {plannedFeatures.map((feature) => (
            <Typography component="li" key={feature} color="text.secondary">
              {feature}
            </Typography>
          ))}
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" onClick={() => navigate(backPath || (user?.role ? `/${user.role.toLowerCase()}/dashboard` : '/'))}>
            Back to Dashboard
          </Button>
          <Button component={Link} to="/" variant="outlined">
            Go home
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ComingSoonPage;
