"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [version, setVersion] = useState("");

  useEffect(() => {
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion("1.0.0"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--nox-bg-base)] p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,var(--nox-border-subtle)_1px,transparent_1px),linear-gradient(to_bottom,var(--nox-border-subtle)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-[var(--nox-border-subtle)] bg-[var(--nox-bg-surface)] p-8 shadow-2xl">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/noxzipper-logo.png"
                alt="NOXZIPPER"
                className="h-40 w-auto object-contain drop-shadow-2xl animate-[logoShine_3s_ease-in-out_infinite]"
              />
            </div>
            <p className="text-sm text-[var(--nox-text-muted)]">
              Kitchen Exhaust Hood Cleaning
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-3 rounded-lg bg-[var(--nox-error)]/10 border border-[var(--nox-error)]/30 p-3 text-sm text-[var(--nox-error)]">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--nox-text-secondary)]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@noxzipper.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[var(--nox-text-secondary)]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-[var(--nox-border-subtle)]">
            <p className="text-center text-xs text-[var(--nox-text-muted)]">
              Demo credentials
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <code className="text-xs bg-[var(--nox-bg-hover)] text-[var(--nox-text-secondary)] px-2 py-1 rounded">
                admin@noxzipper.com
              </code>
              <span className="text-[var(--nox-text-muted)]">/</span>
              <code className="text-xs bg-[var(--nox-bg-hover)] text-[var(--nox-text-secondary)] px-2 py-1 rounded">
                admin123
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-[var(--nox-text-muted)]">
          Fire Safety Compliance System
        </p>
      </div>

      {/* K13 Projects Footer - Fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0 py-3 text-center space-y-1">
        <p className="text-[10px] text-[var(--nox-text-muted)]/40 tracking-wide">
          Built by K13 Projects Software Studios
        </p>
        {version && (
          <p className="text-[10px] italic text-[var(--nox-accent)]/60">
            version {version}
          </p>
        )}
      </div>
    </div>
  );
}
