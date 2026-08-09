import { AppBar, Box, Button, Stack, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const LandingHeader = () => (
  <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', color: 'text.primary', py: 2 }}>
    <Toolbar sx={{ px: { xs: 2, md: 6 }, gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
        <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ width: 42, height: 42, borderRadius: 2, bgcolor: 'primary.main', display: 'grid', placeItems: 'center', color: 'common.white', fontWeight: 700 }}>A</Box>
          <Typography variant="h6" fontWeight={700} sx={{ ml: 1 }}>APIHub</Typography>
        </Box>
      </Box>

      <Stack direction="row" spacing={1} alignItems="center">
        <Button component={RouterLink} to="/login" variant="text">Login</Button>
        <Button component={RouterLink} to="/register" variant="contained">Get Started</Button>
      </Stack>
    </Toolbar>
  </AppBar>
);

export default LandingHeader;
