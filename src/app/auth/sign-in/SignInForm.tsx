"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Film, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent">
              <Film size={18} className="text-accent-foreground" />
            </div>
            <span className="font-bold text-xl text-text-primary">doobdeck</span>
          </div>
          <h1 className="text-2xl font-semibold text-text-primary">Welcome back</h1>
          <p className="text-sm text-text-muted">Sign in to your account</p>
        </div>

        <div className="bg-surface-raised border border-border rounded-xl p-6 space-y-5">
          {authError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-subtle border border-danger/20 text-sm text-danger">
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

        <p className="text-center text-sm text-text-muted">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/sign-up"
            className="text-accent hover:text-accent-dim transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
