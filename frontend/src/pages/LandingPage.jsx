import { Box, Button, Card, Container, Divider, Grid, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { APP_DESCRIPTION } from '../config/appConfig';
import LandingHeader from '../components/LandingHeader';
import LandingFooter from '../components/LandingFooter';

const ApiPlatformIllustration = () => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        minHeight: { xs: 320, md: 460 },
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'rgba(167, 139, 250, 0.24)',
        bgcolor: 'rgba(15, 23, 42, 0.72)',
        boxShadow: '0 24px 70px rgba(10, 10, 20, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      <Box component="style">{`
        .api-illustration .float-slow { animation: api-float-slow 6s ease-in-out infinite; }
        .api-illustration .float-fast { animation: api-float-fast 4.5s ease-in-out infinite; }
        .api-illustration .pulse { animation: api-pulse 3.2s ease-in-out infinite; }
        .api-illustration .stream { animation: api-stream 7s linear infinite; }
        @keyframes api-float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes api-float-fast {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-6px) translateX(4px); }
        }
        @keyframes api-pulse {
          0%, 100% { opacity: 0.82; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes api-stream {
          0% { transform: translateX(-6px); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(18px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .api-illustration .float-slow,
          .api-illustration .float-fast,
          .api-illustration .pulse,
          .api-illustration .stream {
            animation: none !important;
          }
        }
      `}</Box>
      <svg className="api-illustration" viewBox="0 0 640 480" role="img" aria-label="Connected API platform illustration" style={{ width: '100%', height: '100%', maxWidth: 620 }}>
        <defs>
          <linearGradient id="panelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#140d29" />
            <stop offset="55%" stopColor="#221447" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 16 -7" />
          </filter>
        </defs>

        <rect x="20" y="20" width="600" height="440" rx="32" fill="url(#panelGradient)" />
        <circle cx="490" cy="120" r="120" fill="url(#glow)" opacity="0.22" className="pulse" />
        <circle cx="150" cy="360" r="92" fill="url(#glow)" opacity="0.18" className="float-slow" />

        <g opacity="0.9">
          <path d="M165 220 C235 160, 310 165, 365 220" stroke="url(#lineGradient)" strokeWidth="3.2" strokeLinecap="round" fill="none" className="float-slow" />
          <path d="M365 220 C430 170, 500 180, 540 255" stroke="url(#lineGradient)" strokeWidth="3.2" strokeLinecap="round" fill="none" className="float-fast" />
          <path d="M280 270 C300 310, 365 312, 420 276" stroke="url(#lineGradient)" strokeWidth="3.2" strokeLinecap="round" fill="none" className="float-fast" />
          <path d="M190 280 C220 330, 250 340, 280 270" stroke="url(#lineGradient)" strokeWidth="3.2" strokeLinecap="round" fill="none" className="float-slow" />
          <circle cx="220" cy="215" r="5" fill="#d8b4fe" className="stream" />
          <circle cx="410" cy="220" r="5" fill="#93c5fd" className="stream" />
          <circle cx="300" cy="310" r="5" fill="#c084fc" className="stream" />
        </g>

        <g filter="url(#softGlow)">
          <rect x="130" y="180" width="90" height="60" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.4)" />
          <rect x="330" y="170" width="100" height="70" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.4)" />
          <rect x="240" y="280" width="100" height="70" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.4)" />
          <rect x="430" y="260" width="95" height="62" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(167,139,250,0.4)" />
        </g>

        <g className="float-slow">
          <rect x="145" y="196" width="60" height="28" rx="8" fill="url(#nodeGradient)" />
          <path d="M166 208h10m-5-5v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <text x="145" y="242" fill="#f5f3ff" fontSize="14" fontFamily="Inter, Arial, sans-serif">API</text>

          <rect x="347" y="188" width="66" height="30" rx="8" fill="url(#nodeGradient)" />
          <path d="M368 201h10m-5-5v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <text x="347" y="240" fill="#f5f3ff" fontSize="14" fontFamily="Inter, Arial, sans-serif">Cloud</text>

          <rect x="258" y="296" width="64" height="28" rx="8" fill="url(#nodeGradient)" />
          <path d="M280 308h10m-5-5v10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <text x="258" y="346" fill="#f5f3ff" fontSize="14" fontFamily="Inter, Arial, sans-serif">Data</text>

          <rect x="448" y="276" width="54" height="26" rx="8" fill="url(#nodeGradient)" />
          <path d="M468 288h8m-4-4v8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <text x="448" y="324" fill="#f5f3ff" fontSize="14" fontFamily="Inter, Arial, sans-serif">App</text>
        </g>

        <g className="float-fast">
          <circle cx="310" cy="150" r="14" fill="#8b5cf6" opacity="0.9" />
          <circle cx="385" cy="128" r="8" fill="#38bdf8" opacity="0.85" />
          <circle cx="262" cy="122" r="6" fill="#c084fc" opacity="0.85" />
          <path d="M304 150l-22-18" stroke="#c084fc" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" />
          <path d="M321 148l34-20" stroke="#7dd3fc" strokeWidth="2" strokeDasharray="4 4" opacity="0.5" />
        </g>

        <g opacity="0.95">
          <rect x="190" y="88" width="72" height="24" rx="8" fill="rgba(255,255,255,0.07)" stroke="rgba(167,139,250,0.35)" />
          <path d="M210 100h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M238 100l8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M238 100l8 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <rect x="420" y="90" width="66" height="22" rx="8" fill="rgba(255,255,255,0.07)" stroke="rgba(167,139,250,0.35)" />
          <path d="M438 101h20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M464 101l7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          <path d="M464 101l7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
    </Box>
  );
};

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
            <ApiPlatformIllustration />
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
