import { Box, Button, Card, Chip, Container, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { APP_NAME, APP_DESCRIPTION } from '../config/appConfig';
import { featuredApis, categories } from '../mocks/marketplaceMockData';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ApiIcon from '@mui/icons-material/Api';
import ShieldIcon from '@mui/icons-material/Shield';
import SpeedIcon from '@mui/icons-material/Speed';

const LandingPage = () => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 5 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h3" fontWeight={700}>{APP_NAME}</Typography>
            <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 560 }}>{APP_DESCRIPTION}</Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button component={Link} to="/login" variant="outlined">Login</Button>
            <Button component={Link} to="/register" variant="contained">Get Started</Button>
          </Stack>
        </Stack>
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 3, md: 4 }, bgcolor: 'secondary.main', border: 'none' }}>
              <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.18em' }}>Developer-first marketplace</Typography>
              <Typography variant="h2" fontWeight={700} sx={{ mt: 1, mb: 2 }}>Discover APIs that ship faster.</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>Build modern products with trusted APIs, analytics and self-serve onboarding designed for teams of every size.</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button component={Link} to="/marketplace" variant="contained" endIcon={<ArrowForwardIcon />}>Explore APIs</Button>
                <Button component={Link} to="/provider/dashboard" variant="outlined">Publish API</Button>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card sx={{ p: { xs: 3, md: 4 }, height: '100%' }}>
              <Typography variant="h6" fontWeight={700}>API Search Preview</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Search, compare and review APIs from a centrally curated catalog.</Typography>
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                {featuredApis.slice(0, 2).map((api) => (
                  <Box key={api.id} sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={700}>{api.name}</Typography>
                      <Chip label={api.status} size="small" color={api.status === 'Published' ? 'success' : 'warning'} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">{api.category} • {api.subscribers} subscribers</Typography>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>
        </Grid>
        <Grid container spacing={3} sx={{ mt: 3 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700}>Popular Categories</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                {categories.map((category) => <Chip key={category} label={category} variant="outlined" />)}
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" fontWeight={700}>Why APIHub</Typography>
              <Stack spacing={2} sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1.5}>
                  <ShieldIcon color="primary" />
                  <Box><Typography fontWeight={700}>Trusted delivery</Typography><Typography variant="body2" color="text.secondary">Built-in visibility and simple governance.</Typography></Box>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <SpeedIcon color="primary" />
                  <Box><Typography fontWeight={700}>Fast onboarding</Typography><Typography variant="body2" color="text.secondary">Launch integrations quickly with clear docs.</Typography></Box>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <ApiIcon color="primary" />
                  <Box><Typography fontWeight={700}>Developer controls</Typography><Typography variant="body2" color="text.secondary">Manage subscriptions, keys, and usage from one place.</Typography></Box>
                </Stack>
              </Stack>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, height: '100%', bgcolor: 'secondary.main' }}>
              <Typography variant="h6" fontWeight={700}>For providers</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Publish APIs with polished profiles, approval pipelines, and subscriber insights.</Typography>
              <Button component={Link} to="/register" variant="contained" sx={{ mt: 2 }}>Join as Provider</Button>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Container>
  </Box>
);

export default LandingPage;
