import React from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface LegalShellProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

/**
 * Shared frame for legal pages (Privacy, Terms).
 * Prose styling: section headings gold, comfortable spacing, muted lists.
 */
const LegalShell: React.FC<LegalShellProps> = ({
  title,
  lastUpdated,
  children,
}) => (
  <div className="mx-auto max-w-3xl">
    <Button
      variant="ghost"
      onClick={() => window.history.back()}
      className="mb-4 gap-2 text-muted-foreground hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      Back
    </Button>

    <Card className="border-border/60 bg-card/70">
      <CardContent className="p-6 sm:p-8">
        <h1 className="font-display text-4xl font-bold text-primary">{title}</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          <strong>Last updated:</strong> {lastUpdated}
        </p>
        <div
          className="space-y-3 leading-relaxed text-foreground/90
            [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-primary
            [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6
            [&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline"
        >
          {children}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default LegalShell;
