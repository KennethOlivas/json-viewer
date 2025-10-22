import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background font-sans">
      <main className="w-full max-w-4xl px-6 py-16">
        <div className="mb-8 flex items-center gap-3">
          <Image className="dark:invert" src="/next.svg" alt="Next.js logo" width={100} height={20} priority />
          <h1 className="text-2xl font-semibold">JSON Viewer & Editor</h1>
        </div>
        <p className="mb-6 text-muted-foreground">A modern, animated toolkit for viewing, editing, validating, and comparing JSON.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["/tree-view", "Tree View"],
            ["/raw-view", "Raw View"],
            ["/formatter", "Formatter"],
            ["/search", "Search"],
            ["/theme", "Theme"],
            ["/sessions", "Sessions"],
            ["/compare", "Compare"],
            ["/convert", "Convert"],
            ["/graph-view", "Graph View"],
          ].map(([href, label]) => (
            <Link key={href} href={href} className="rounded border p-4 hover:bg-secondary">
              {label}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
