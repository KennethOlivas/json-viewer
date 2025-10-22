"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useJson } from "@/providers/JsonProvider";
import { toast } from "sonner";
import { VTLink } from "@/components/VTLink";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Braces,
  Menu,
  TreeDeciduous,
  Code2,
  Scissors,
  ArrowLeftRight,
  Repeat2,
  Network,
} from "lucide-react";
import { cn } from "@/lib/utils";

function Logo({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center gap-2", className)}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"
        initial={{ rotate: -8, scale: 0.9 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <Braces className="h-5 w-5" />
      </motion.div>
      <span className="text-base font-semibold">JSON Studio</span>
    </motion.div>
  );
}

const navItems = [
  { href: "/", label: "Home" },
  { href: "/tree-view", label: "Tree View" },
  { href: "/raw-view", label: "Raw View" },
  { href: "/formatter", label: "Formatter" },
  { href: "/compare", label: "Compare" },
  { href: "/convert", label: "Convert" },
  { href: "/graph-view", label: "Graph View" },
];

export default function Home() {
  const featuresRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [jsonText, setJsonText] = useState<string>('{\n  "hello": "world"\n}');
  const { setData } = useJson();

  const onExplore = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onFile = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
  };

  const onImport = () => {
    try {
      const parsed = JSON.parse(jsonText);
      setData(parsed);
      toast.success("JSON loaded");
      setOpen(false);
    } catch {
      toast.error("Invalid JSON");
    }
  };

  return (
    <div className="relative min-h-dvh bg-background font-sans flex flex-col">
      {/* Header */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((n) => (
            <VTLink
              key={n.href}
              href={n.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="underline-offset-8 hover:underline">
                {n.label}
              </span>
            </VTLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <Separator className="my-3" />
              <div className="grid gap-2">
                {navItems.map((n) => (
                  <VTLink
                    key={n.href}
                    href={n.href}
                    className="rounded px-2 py-2 text-sm hover:bg-secondary"
                  >
                    {n.label}
                  </VTLink>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Hero */}
  <main className="mx-auto w-full max-w-6xl px-4 flex-1">
        <section className="relative overflow-hidden rounded-xl border bg-card px-6 py-14 text-center md:px-12">
          <motion.h1
            className="mx-auto max-w-3xl text-3xl font-semibold tracking-tight md:text-4xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Powerful JSON Viewer & Editor
          </motion.h1>
          <motion.p
            className="mx-auto mt-3 max-w-2xl text-balance text-muted-foreground"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            View, edit, and visualize JSON data with elegance and speed.
          </motion.p>
          <motion.div
            className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
          >
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full sm:w-auto">
                  Open JSON
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                  <DialogTitle>Open JSON</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) => onFile(e.target.files?.[0])}
                  />
                  <textarea
                    className="min-h-48 w-full resize-y rounded border bg-background p-3 font-mono text-sm"
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    placeholder="Paste JSON here..."
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={onImport}>Import</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={onExplore}
            >
              Explore Features
            </Button>
          </motion.div>
        </section>

        {/* Features Preview */}
        <section ref={featuresRef} className="mx-auto mt-10 max-w-6xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Explore</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              href="/tree-view"
              title="Tree View"
              Icon={TreeDeciduous}
            >
              Expand and edit nodes inline.
            </FeatureCard>
            <FeatureCard href="/raw-view" title="Raw View" Icon={Code2}>
              Monaco editor with validation.
            </FeatureCard>
            <FeatureCard href="/formatter" title="Formatter" Icon={Scissors}>
              Pretty print or minify instantly.
            </FeatureCard>
            <FeatureCard href="/compare" title="Compare" Icon={ArrowLeftRight}>
              See what’s changed between two JSONs.
            </FeatureCard>
            <FeatureCard href="/convert" title="Convert" Icon={Repeat2}>
              JSON↔YAML↔CSV conversions.
            </FeatureCard>
            <FeatureCard href="/graph-view" title="Graph View" Icon={Network}>
              Visualize relationships and structure.
            </FeatureCard>
          </div>
        </section>
      </main>

      {/* Footer */}
  <footer className="mt-auto py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 text-center text-sm md:flex-row md:text-left">
          <div className="text-muted-foreground">
            © {new Date().getFullYear()} JSON Studio
          </div>
          <div className="flex items-center gap-4">
            <a
              className="text-muted-foreground hover:text-foreground"
              href="https://github.com/"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            <a
              className="text-muted-foreground hover:text-foreground"
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
            >
              Twitter
            </a>
            <a
              className="text-muted-foreground hover:text-foreground"
              href="mailto:contact@example.com"
            >
              Contact
            </a>
          </div>
          <div className="text-muted-foreground">
            Made with ♥ using ShadCN + Framer Motion
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  href,
  title,
  Icon,
  children,
}: {
  href: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <VTLink href={href} className="block">
        <Card className="h-full cursor-pointer border bg-card transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Icon className="h-4 w-4" /> {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {children}
          </CardContent>
        </Card>
      </VTLink>
    </motion.div>
  );
}
