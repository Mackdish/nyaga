import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthState = {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  configured: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAdmin: false,
  configured: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const finishLoading = () => {
      if (mounted) setLoading(false);
    };

    const fetchAdminRole = async (userId: string) => {
      try {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        if (mounted) setIsAdmin(!!data);
      } catch (err) {
        console.warn("[auth] Failed to load admin role:", err);
        if (mounted) setIsAdmin(false);
      }
    };

    let subscription: { unsubscribe: () => void } | undefined;

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (nextUser) {
          void fetchAdminRole(nextUser.id);
        } else {
          setIsAdmin(false);
        }
      });
      subscription = data.subscription;

      void supabase.auth
        .getSession()
        .then(async ({ data: { session } }) => {
          if (!mounted) return;
          setUser(session?.user ?? null);
          if (session?.user) await fetchAdminRole(session.user.id);
        })
        .catch((err) => {
          console.warn("[auth] Failed to restore session:", err);
          if (mounted) setUser(null);
        })
        .finally(finishLoading);
    } catch (err) {
      console.error("[auth] Supabase auth unavailable:", err);
      finishLoading();
    }

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, configured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
