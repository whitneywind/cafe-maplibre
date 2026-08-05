import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, Button, Box, Typography } from '@mui/material';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../stores/useAuthStore';

export const AuthModal = () => {
  const open = useAuthStore((s) => s.authModalOpen);
  const promptMessage = useAuthStore((s) => s.authModalMessage);
  const closeAuthModal = useAuthStore((s) => s.closeAuthModal);

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setEmail('');
    setPassword('');
    setError(null);
    setMessage(null);
  };

  const handleClose = () => {
    reset();
    closeAuthModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const { error } =
      mode === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === 'signup') {
      setMessage('Check your email to confirm your account.');
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{mode === 'login' ? 'Log in' : 'Sign up'}</DialogTitle>
      <DialogContent>
        {promptMessage && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {promptMessage}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            inputProps={{ minLength: 6 }}
          />

          {error && <Typography color="error" variant="body2">{error}</Typography>}
          {message && <Typography color="success.main" variant="body2">{message}</Typography>}

          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? '...' : mode === 'login' ? 'Log in' : 'Sign up'}
          </Button>

          <Button
            size="small"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); reset(); }}
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};