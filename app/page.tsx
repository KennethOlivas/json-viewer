"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { useJson } from "@/providers/JsonProvider";
import { Button } from "@/components/ui/button";
import {
  TreeDeciduous,
  Code2,
  Scissors,
  ArrowLeftRight,
  Repeat2,
  Network,
} from "lucide-react";
import { FeatureCard } from "@/components/FeatureCard";
import { JsonImportButton } from "@/components/JsonImportButton";
import { OpenJsonButton } from "@/components/OpenJsonButton";

export default function Home() {
  const featuresRef = useRef<HTMLDivElement | null>(null);
  // Using button components for dialogs; no local dialog state needed here
  // Access to provider retained if future callbacks needed
  const {} = useJson();

  const onExplore = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Optional: use callbacks if needed in future for imported JSON

  return (
    <div className="relative font-sans flex flex-col justify-between">
      {/* Hero */}
      <main className="mx-auto w-full max-w-6xl px-4 flex-1 mt-4">
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
            <OpenJsonButton
              label="Open JSON"
              size="lg"
              variant="default"
              className="w-full sm:w-auto"
            />
            <JsonImportButton
              label="Import JSON"
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
            />
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
    </div>
  );
}
