import React from "react";
import { Share2 } from "lucide-react";

/** Floating share button shown once a reading exists. */
export const ShareFab: React.FC<{ onClick: () => void; label?: string }> = ({
  onClick,
  label = "share",
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="fixed bottom-4 right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:scale-105 hover:bg-gold-soft"
  >
    <Share2 className="size-5" />
  </button>
);

export default ShareFab;
