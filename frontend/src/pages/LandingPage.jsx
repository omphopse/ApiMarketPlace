import { Box, Button, Card, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { APP_DESCRIPTION } from '../config/appConfig';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';

const LandingPage = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <LandingHeader />
      <Container maxWidth="xl" sx={{ pt: { xs: 4, md: 6 }, pb: { xs: 6, md: 10 } }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ maxWidth: 560 }}>
              <Typography variant="overline" color="primary" fontWeight={700} sx={{ letterSpacing: '0.2em', mb: 2 }}>
                THE API MARKETPLACE FOR DEVELOPERS
              </Typography>
              <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1.05, mb: 3 }}>
                Build faster with APIs that are ready to integrate.
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 520, fontSize: '1rem' }}>
                {APP_DESCRIPTION}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button component={RouterLink} to="/login" variant="contained" size="large">
                  Explore APIs
                </Button>
                <Button component="a" href="#how-it-works" variant="outlined" size="large">
                  How It Works
                </Button>
              </Stack>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, bgcolor: 'background.paper', borderRadius: 4, boxShadow: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                Public browsing, secure checkout
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Browse the marketplace and view API details without signing in. When you're ready to subscribe, log in to complete checkout securely.
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography fontWeight={700}>Browse without barriers</Typography>
                  <Typography color="text.secondary">Explore API offerings and provider details as a guest user.</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={700}>Checkout requires login</Typography>
                  <Typography color="text.secondary">Subscription and payment pages are protected until you sign in.</Typography>
                </Box>
                <Box>
                  <Typography fontWeight={700}>Developer-ready details</Typography>
                  <Typography color="text.secondary">API documentation and usage tools become available after onboarding.</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 10 }} id="how-it-works">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
            How it works
          </Typography>
          <Grid container spacing={3}>
            {[
              { title: 'Discover', description: 'Find APIs for your project with clear provider and integration details.' },
              { title: 'Choose a plan', description: 'Review available plans and decide what fits your needs.' },
              { title: 'Subscribe', description: 'Log in to securely sign up for the plan you want.' },
              { title: 'Integrate', description: 'Use your API key and begin building immediately.' }
            ].map((step, index) => (
              <Grid item xs={12} md={6} lg={3} key={step.title}>
                <Card sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: 'primary.main', color: 'common.white', display: 'grid', placeItems: 'center', mb: 2 }}>
                    {`0${index + 1}`}
                  </Box>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">{step.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10 }} id="documentation">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 3 }}>
            Why APIHub
          </Typography>
          <Grid container spacing={3}>
            {[
              { title: 'Discover APIs', description: 'A single place to review API capabilities from multiple providers.' },
              { title: 'One marketplace', description: 'Compare APIs across categories without needing a separate site.' },
              { title: 'Developer friendly', description: 'Clean details and clear next steps for integration.' },
              { title: 'Provider-ready', description: 'Publish and manage your API offerings in one platform.' }
            ].map((feature) => (
              <Grid item xs={12} md={6} key={feature.title}>
                <Card sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography fontWeight={700} sx={{ mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary">{feature.description}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mt: 10, p: 4, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h4" fontWeight={700}>
                Have an API? Publish it on APIHub.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                Reach developers looking for ready-to-use APIs and manage listings, plans and documentation from one platform.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button component={RouterLink} to="/register" variant="contained" size="large">
                Publish Your API
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Container>
      <Divider />
      <LandingFooter />
    </Box>
  );
};

export default LandingPage;
