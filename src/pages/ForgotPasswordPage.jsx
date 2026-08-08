import { useState } from 'react';
import { Box, Button, Card, Container, Stack, TextField, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success(`A reset link was prepared for ${email || 'your inbox'}.`);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h4" fontWeight={700}>Reset your password</Typography>
              <Typography color="text.secondary">Enter your email and we will send a mock recovery link.</Typography>
            </Box>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
              <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
              <Button variant="contained" type="submit">Send recovery link</Button>
            </Box>
            <Button component={Link} to="/login" variant="text">Back to login</Button>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPasswordPage;
