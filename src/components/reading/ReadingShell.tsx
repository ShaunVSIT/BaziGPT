import React from "react";
import { BrandMark } from "@/components/brand/Logo";

/** Shared header + gradient card frame for Solo & Compatibility readings. */
export const ReadingShell: React.FC<{
  subtitle: string;
  children: React.ReactNode;
}> = ({ subtitle, children }) => (
  <div className="mx-auto max-w-2xl">
    <div className="mb-5 text-center">
      <div className="mb-2 flex items-center justify-center gap-2.5">
        <BrandMark size={40} />
        <span className="font-display text-4xl font-bold text-foreground">
          BaziGPT
        </span>
      </div>
      <p className="text-lg text-muted-foreground">{subtitle}</p>
    </div>
    <div className="rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5 p-4 sm:p-6">
      {children}
    </div>
  </div>
);

export default ReadingShell;
