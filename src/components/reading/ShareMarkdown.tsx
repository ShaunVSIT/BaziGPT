import React, { Suspense } from "react";
import type { Components } from "react-markdown";

const ReactMarkdown = React.lazy(() => import("react-markdown"));

// Inline hex styles only — this markdown is rasterized by html2canvas.
const GOLD = "#c9a227";
const TEXT = "#f4f1ea";

const components: Components = {
  h1: ({ children }) => (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 18, margin: "10px 0 4px" }}>{children}</div>
  ),
  h2: ({ children }) => (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 16, margin: "10px 0 4px" }}>{children}</div>
  ),
  h3: ({ children }) => (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 15, margin: "8px 0 4px" }}>{children}</div>
  ),
  strong: ({ children }) => <span style={{ color: GOLD, fontWeight: 700 }}>{children}</span>,
  li: ({ children }) => <li style={{ marginBottom: 4, color: TEXT }}>{children}</li>,
  p: ({ children }) => (
    <p style={{ color: TEXT, margin: "0 0 8px", lineHeight: 1.6, fontSize: 14 }}>{children}</p>
  ),
};

/** Markdown renderer for the rasterized share card (inline hex styles). */
export const ShareMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <Suspense fallback={null}>
    <ReactMarkdown components={components}>{children}</ReactMarkdown>
  </Suspense>
);

export default ShareMarkdown;
