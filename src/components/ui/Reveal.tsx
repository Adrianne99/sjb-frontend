// Fades its content up when it scrolls into view (once). Used on the website.
//
//   <Reveal>...</Reveal>                 one block
//   <Reveal delay={index * 90}>...</Reveal>   items in a list, one after another
//
// People who turned on "reduce motion" see the content right away (base.css).
import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface RevealProps {
  children: ReactNode;
  /** Wait this many milliseconds before animating (for staggered lists). */
  delay?: number;
  /** The HTML element to render (default: div). Use "li" inside lists. */
  as?: ElementType;
  className?: string;
}

export function Reveal({ children, delay = 0, as: Tag = "div", className }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === "undefined");

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      // Start a little before it is fully on screen, so it never feels late.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <Tag ref={ref} className={cn("reveal", visible && "is-visible", className)} style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}
