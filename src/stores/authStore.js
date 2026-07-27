import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export const useAuthStore = create((set) => ({
  session: null,
  user: null,
  loading: true,
  signOut: () => supabase.auth.signOut(),
}));

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    loading: false,
  });
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
  });
});