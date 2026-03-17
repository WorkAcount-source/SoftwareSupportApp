"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface UserRole {
  isAdmin: boolean;
  isTeamMember: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: UserRole;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  /** Returns true if the user is an admin. */
  requireAdmin: () => boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const NO_ROLE: UserRole = { isAdmin: false, isTeamMember: false };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<UserRole>(NO_ROLE);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchRole = useCallback(async (email: string) => {
    const { data } = await getSupabase()
      .from("team_members")
      .select("is_admin")
      .eq("email", email)
      .eq("is_active", true)
      .single();

    if (data) {
      setRole({ isAdmin: data.is_admin, isTeamMember: true });
    } else {
      setRole(NO_ROLE);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchRole(session.user.email);
      }
      setLoading(false);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user?.email) {
        fetchRole(session.user.email);
      } else {
        setRole(NO_ROLE);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      const { error } = await getSupabase().auth.signInWithPassword({
        email,
        password,
      });
      if (error) return { error: error.message };
      setShowLoginModal(false);
      return { error: null };
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<{ error: string | null }> => {
      // Restrict signup to allowed email domain if configured
      const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN;
      if (allowedDomain && !email.toLowerCase().endsWith(`@${allowedDomain.toLowerCase()}`)) {
        return { error: `Only @${allowedDomain} email addresses are allowed.` };
      }

      const { data, error } = await getSupabase().auth.signUp({
        email,
        password,
      });
      if (error) return { error: error.message };

      // If the session is returned immediately (email confirmation disabled),
      // the user is already signed in — update state and close the modal.
      if (data.session) {
        setUser(data.session.user);
        await fetchRole(data.session.user.email ?? "");
        setShowLoginModal(false);
      }

      return { error: null };
    },
    [fetchRole]
  );

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setUser(null);
    setRole(NO_ROLE);
  }, []);

  const requireAdmin = useCallback((): boolean => {
    if (!user) {
      setShowLoginModal(true);
      return false;
    }
    if (!role.isAdmin) {
      alert("Only admins can perform this action.");
      return false;
    }
    return true;
  }, [user, role]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        signIn,
        signUp,
        signOut,
        requireAdmin,
        showLoginModal,
        setShowLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
