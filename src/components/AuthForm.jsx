import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function AuthForm() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
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
    }
    // on login success, AuthProvider's listener updates session automatically
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{mode === 'login' ? 'Log in' : 'Sign up'}</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? '...' : mode === 'login' ? 'Log in' : 'Sign up'}
      </button>

      <p>
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          type="button"
          onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login' ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </form>
  );
}