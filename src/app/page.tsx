import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Film, ArrowRight } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent">
            <Film size={24} className="text-accent-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary">
            doobdeck
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-lg text-text-secondary">
          Your personal film stills directory. Save, organise, and explore the
          moments that move you.
        </p>

        {/* Feature list */}
        <ul className="text-sm text-text-muted space-y-2 text-left max-w-sm mx-auto">
          {[
            "Upload and organise film stills",
            "Automatic colour palette extraction",
            "Filter by film, director, tag, folder",
            "Private — only you see your collection",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/auth/sign-up"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent-dim transition-colors"
          >
            Get started
            <ArrowRight size={16} />
          </Link>
          <Link
            href="/auth/sign-in"
            className="inline-flex items-center h-11 px-6 rounded-lg border border-border text-text-primary font-medium hover:bg-surface-raised transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
