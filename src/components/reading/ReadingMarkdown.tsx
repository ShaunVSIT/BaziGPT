import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const ReactMarkdown = React.lazy(() => import("react-markdown"));

/** Gold-themed prose renderer for AI readings (not rasterized — uses theme tokens).
 *  Memoized: react-markdown parsing is a synchronous main-thread cost, so we
 *  only re-run it when the markdown string actually changes — not on every
 *  parent re-render (follow-up clicks, share dialog, etc.). This is a key INP win. */
export const ReadingMarkdown: React.FC<{
  children: string;
  className?: string;
}> = React.memo(({ children, className }) => (
  <div
    className={cn(
      "leading-relaxed text-foreground/90",
      "[&_h1]:mt-4 [&_h1]:mb-1 [&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-primary",
      "[&_h2]:mt-4 [&_h2]:mb-1 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-primary",
      "[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-primary",
      "[&_strong]:font-semibold [&_strong]:text-primary",
      "[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6",
      "[&_li]:mb-1 [&_p]:mb-3",
      "[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
      className
    )}
  >
    <Suspense
      fallback={<Loader2 className="size-4 animate-spin text-primary" />}
    >
      <ReactMarkdown>{children}</ReactMarkdown>
    </Suspense>
  </div>
));
ReadingMarkdown.displayName = "ReadingMarkdown";

export default ReadingMarkdown;
