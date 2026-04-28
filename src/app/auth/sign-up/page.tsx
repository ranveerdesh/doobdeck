"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Film, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
              <Film size={18} className="text-accent-foreground" />
            </div>
            <span className="font-bold text-xl text-text-primary">doobdeck</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Create account</h1>
          <p className="text-sm text-text-muted">
            Start building your film stills collection
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface-raised border border-border rounded-xl p-6 space-y-5">
          {authError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-subtle border border-danger/20 text-sm text-danger">
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

        <p className="text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link
            href="/auth/sign-in"
            className="text-accent hover:text-accent-dim transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
