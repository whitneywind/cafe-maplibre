import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase.ts';

interface AuthState {
  session: Session | null;
  user: User | null;
  role: string | null;
  loading: boolean;
  signOut: () => Promise<{ error: Error | null }>;
  fetchRole: () => Promise<void>;
  authModalOpen: boolean;
  authModalMessage: string | null;
  openAuthModal: (message?: string) => void;
  closeAuthModal: () => void;
}

const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: () => supabase.auth.signOut(),
  fetchRole: async () => {
    const { session } = get();
    if (!session?.access_token) return;
    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch role");
      const data = await res.json();
      set({ role: data.role });
    } catch (err) {
      console.error("Error fetching role:", err);
      set({ role: null });
    }
  },
  authModalOpen: false,
  authModalMessage: null,
  openAuthModal: (message) => set({ authModalOpen: true, authModalMessage: message }),
  closeAuthModal: () => set({ authModalOpen: false, authModalMessage: null }),
}));

supabase.auth.getSession().then(({ data: { session } }) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
    loading: false,
  });
  if (session) useAuthStore.getState().fetchRole();
});

supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.setState({
    session,
    user: session?.user ?? null,
  });
  if (session) {
    useAuthStore.getState().fetchRole();
  } else {
    useAuthStore.setState({ role: null });
  }
});

export default useAuthStore;