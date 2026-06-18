import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered reveal. Children start hidden (blurred + offset) and
 * animate in when scrolled into view. Stagger siblings with `delay`.
 * Honors prefers-reduced-motion via the `.reveal` CSS (no transition there).
 */
export function useInView<T extends Element = HTMLDivElement>(
  options?: IntersectionObserverInit & { once?: boolean }
) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (options?.once !== false) observer.unobserve(entry.target);
        } else if (options?.once === false) {
          setInView(false);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px", ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
}

export const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "li";
}> = ({ children, className, delay = 0, as = "div" }) => {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Comp = as as React.ElementType;
  return (
    <Comp
      ref={ref}
      className={cn("reveal", inView && "in-view", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Comp>
  );
};

export default Reveal;
