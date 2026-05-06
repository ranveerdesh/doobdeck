"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Film } from "lucide-react";
import { signInSchema, type SignInInput } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInInput) => {
    setAuthError("");
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("Invalid email or password");
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,183,125,0.08),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6 self-center">
            <div className="inline-flex items-center gap-3 rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Film size={18} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
                  doobdeck
                </p>
                <p className="text-sm text-text-secondary">Private film archive</p>
              </div>
            </div>
            <div className="space-y-3 max-w-md">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
                sign in
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-text-primary">
                Welcome back.
              </h1>
              <p className="text-base leading-7 text-text-secondary">
                Continue browsing your archive, search your collection, and keep the visual library in one place.
              </p>
            </div>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-dim"
            >
              Need an account? Create one
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="self-center rounded-md border border-border/80 bg-surface-container-low/85 p-6 shadow-modal sm:p-8">
          {authError && (
            <div className="flex items-center gap-2 rounded-md border border-danger/20 bg-danger-subtle px-3 py-3 text-sm text-danger">
              <AlertCircle size={14} />
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              {...register("email")}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
              error={errors.password?.message}
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Sign in
            </Button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
