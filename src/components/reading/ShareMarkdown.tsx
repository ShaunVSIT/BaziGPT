import React, { Suspense } from "react";

const ReactMarkdown = React.lazy(() => import("react-markdown"));

// Inline hex styles only — this markdown is rasterized by html2canvas.
const GOLD = "#c9a227";
const TEXT = "#f4f1ea";

const components = {
  h1: (p: any) => (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 18, margin: "10px 0 4px" }} {...p} />
  ),
  h2: (p: any) => (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 16, margin: "10px 0 4px" }} {...p} />
  ),
  h3: (p: any) => (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 15, margin: "8px 0 4px" }} {...p} />
  ),
  strong: (p: any) => <span style={{ color: GOLD, fontWeight: 700 }}>{p.children}</span>,
  li: (p: any) => <li style={{ marginBottom: 4, color: TEXT }}>{p.children}</li>,
  p: (p: any) => (
    <p style={{ color: TEXT, margin: "0 0 8px", lineHeight: 1.6, fontSize: 14 }} {...p} />
  ),
};

/** Markdown renderer for the rasterized share card (inline hex styles). */
export const ShareMarkdown: React.FC<{ children: string }> = ({ children }) => (
  <Suspense fallback={null}>
    <ReactMarkdown components={components}>{children}</ReactMarkdown>
  </Suspense>
);

export default ShareMarkdown;
