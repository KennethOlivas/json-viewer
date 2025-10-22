import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VTLink } from "@/components/VTLink";
import { motion } from "framer-motion";

export function FeatureCard({
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
