"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowRight, Film } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignUpPage() {
  const router = useRouter();
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpInput) => {
    setAuthError("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setAuthError(json.error ?? "Registration failed");
      return;
    }

    // Auto sign in after registration
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("Account created but sign-in failed. Please sign in manually.");
    } else {
      router.push("/dashboard");
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
                sign up
              </p>
              <h1 className="text-4xl font-semibold tracking-tight text-text-primary">
                Build your archive.
              </h1>
              <p className="text-base leading-7 text-text-secondary">
                Create an account, unlock the collection tools, and start cataloguing stills with the same structure you use to review them.
              </p>
            </div>
            <Link
              href="/auth/sign-in"
              className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-colors hover:text-accent-dim"
            >
              Already registered? Sign in
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
              label="Name" 
              autoComplete="name"
              {...register("name")}
              error={errors.name?.message}
            />
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
              autoComplete="new-password"
              {...register("password")}
              error={errors.password?.message}
              hint="At least 8 characters"
            />
            <Input
              label="Invite Code"
              placeholder="Enter your invite code"
              {...register("inviteCode")}
              error={errors.inviteCode?.message}
              hint="Required to create an account"
            />
            <Button type="submit" className="w-full" loading={isSubmitting}>
              Create account
            </Button>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
}
