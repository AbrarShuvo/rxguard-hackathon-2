"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/* One tiny IntersectionObserver hook — the reliable reveal trigger.
   Falls back to visible immediately if IO is unavailable, and a
   safety timeout guarantees content is never stuck invisible. */
export function useInView<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" }
    );
    io.observe(el);
    const t = setTimeout(() => setInView(true), 1800); // never hide a verdict
    return () => {
      io.disconnect();
      clearTimeout(t);
    };
  }, [threshold]);
  return { ref, inView };
}

type RevealProps = {
  children: ReactNode;
  /** left | right | up — direction the element enters from */
  from?: "left" | "right" | "up";
  delay?: number;
  className?: string;
  style?: CSSProperties;
};

/** Scroll-reveal wrapper. Content is visible by default in print /
    reduced-motion (see globals.css); IO adds .is-visible. */
export function Reveal({ children, from = "up", delay = 0, className = "", style }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>(0.15);
  const dir = from === "left" ? "reveal-left" : from === "right" ? "reveal-right" : "reveal-up";
  return (
    <div
      ref={ref}
      className={`reveal ${dir} ${inView ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}

/** Count-up number. Fires once when scrolled into view (rAF, easeOutCubic). */
export function CountUp({ to, suffix = "", duration = 1200, className = "" }: { to: number; suffix?: string; duration?: number; className?: string }) {
  const { ref, inView } = useInView<HTMLSpanElement>(0.3);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(to * e));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {n}
      {suffix}
    </span>
  );
}

/** Fixed top scroll-progress bar (teal → coral). Pure rAF, no deps. */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        el.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="scroll-progress fixed left-0 top-0 z-[60] h-[3px] w-full origin-left"
      style={{ transform: "scaleX(0)", background: "linear-gradient(90deg,#0d9488,#10b981 45%,#B05A44)" }}
    />
  );
}
