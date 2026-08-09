import { Box, Container, Divider, Stack, Typography } from '@mui/material';

const LandingFooter = () => (
  <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', py: { xs: 6, md: 8 } }}>
    <Container maxWidth="xl">
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={700}>APIHub</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 560 }}>
          A developer-first API marketplace for discovering, subscribing and integrating APIs from trusted providers.
        </Typography>
      </Stack>

      <Divider sx={{ my: 5 }} />

      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography color="text.secondary">© APIHub</Typography>
        <Stack direction="row" spacing={2}>
          <Typography color="text.secondary">Terms</Typography>
          <Typography color="text.secondary">Privacy</Typography>
        </Stack>
      </Stack>
    </Container>
  </Box>
);

export default LandingFooter;
