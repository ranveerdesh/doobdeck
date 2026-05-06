import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Film,
  Layers3,
  Palette,
  Shield,
  Sparkles,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,183,125,0.11),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(255,183,125,0.06),transparent_20%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid w-full gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 shadow-card">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Film size={20} />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
                  cinematic archive
                </p>
                <h1 className="text-lg font-semibold tracking-tight text-text-primary">
                  doobdeck
                </h1>
              </div>
            </div>

            <div className="space-y-5 max-w-2xl">
              <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
                film still workspace
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                A curated archive for stills, frames, and visual reference.
              </h2>
              <p className="max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
                Save stills, organise them by folder and category, extract their colours, and move through the collection like a darkroom contact sheet.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/sign-up"
                className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground shadow-[0_12px_28px_rgba(217,119,7,0.18)] transition-all hover:brightness-105"
              >
                Get started
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center rounded-md border border-border/80 bg-surface-container-low/70 px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-white/[0.03]"
              >
                Sign in
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  icon: Sparkles,
                  title: "Fast capture",
                  body: "Upload and tag a still in a few focused steps.",
                },
                {
                  icon: Palette,
                  title: "Palette aware",
                  body: "Automatic colour extraction keeps the archive searchable.",
                },
                {
                  icon: Layers3,
                  title: "Structured",
                  body: "Folders, categories, and tags keep the collection coherent.",
                },
                {
                  icon: Shield,
                  title: "Private",
                  body: "Your library stays personal and accessible only to you.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-md border border-border/80 bg-surface-container-low/75 p-4 shadow-card"
                >
                  <Icon className="mb-3 text-accent" size={18} />
                  <h3 className="text-sm font-medium text-text-primary">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-text-muted">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex items-stretch">
            <div className="relative flex w-full flex-col justify-between overflow-hidden rounded-md border border-border/80 bg-surface-container-low/85 p-6 shadow-modal">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),transparent_28%)]" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                      contact sheet
                    </p>
                    <p className="mt-1 text-sm text-text-secondary">
                      Recent archive activity
                    </p>
                  </div>
                  <div className="rounded-md border border-border/80 bg-accent/10 px-3 py-2 text-right">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                      ready
                    </p>
                    <p className="text-sm font-medium text-text-primary">for review</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Editorial framing",
                    "Film metadata",
                    "Colour harmony",
                    "Search-driven browsing",
                  ].map((label) => (
                    <div
                      key={label}
                      className="rounded-md border border-border/70 bg-surface/60 px-4 py-4"
                    >
                      <div className="h-1.5 w-10 rounded-full bg-accent" />
                      <p className="mt-3 text-sm font-medium text-text-primary">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-10 grid grid-cols-3 gap-3 border-t border-border/70 pt-5 text-sm">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    format
                  </p>
                  <p className="mt-1 text-text-primary">Archive</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    tone
                  </p>
                  <p className="mt-1 text-text-primary">Ink & amber</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                    mode
                  </p>
                  <p className="mt-1 text-text-primary">Private</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
