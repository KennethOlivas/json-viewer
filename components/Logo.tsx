import { cn } from "@/lib/utils";
import { Braces } from "lucide-react";

import { motion } from "framer-motion";

export function Logo({ className }: { className?: string }) {
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
