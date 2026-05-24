import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => {
    const raw = typeof search.redirect === "string" ? search.redirect : "/account";
    const redirect = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";
    return { redirect };
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign In — Intech Computer Shop" },
      { name: "description", content: "Sign in or create your Intech Computer Shop account." },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { user, loading, configured } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: redirect });
    }
  }, [loading, user, navigate, redirect]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      toast.error("Sign-in is not available on this deployment yet");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your email to confirm.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (!data.session) {
          toast.error("Sign-in succeeded but no session was created. Confirm your email first.");
          return;
        }
        toast.success("Welcome back!");
        navigate({ to: redirect });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SiteLayout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>
      </SiteLayout>
    );
  }

  if (!configured) {
    return (
      <SiteLayout>
        <div className="container mx-auto max-w-md px-4 py-16 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign-in unavailable</h1>
          <p className="text-muted-foreground mb-6">
            Authentication is not configured on this deployment yet.
          </p>
          <Link to="/" className="text-primary font-medium hover:underline">← Back to store</Link>
        </div>
      </SiteLayout>
    );
  }

  if (user) return null;

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold mb-6">{mode === "signin" ? "Sign In" : "Create Account"}</h1>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border">
          {mode === "signup" && (
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            {mode === "signin" ? "No account? " : "Have an account? "}
            <button type="button" className="text-primary font-medium" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
          <p className="text-xs text-center text-muted-foreground">
            <Link to="/" className="hover:underline">← Back to store</Link>
          </p>
        </form>
      </div>
    </SiteLayout>
  );
}
