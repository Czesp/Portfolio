"use client";

import { createContext, useContext, useLayoutEffect, useRef, type FocusEvent, type ReactNode } from "react";

export const DepthContext = createContext(false);

/** Keeps native document scrolling, while each chapter travels through a perspective camera. */
export default function DepthSection({ id, className, children }: { id: string; className: string; children: ReactNode }) {
  const enabled = useContext(DepthContext);
  const track = useRef<HTMLDivElement>(null);
  const camera = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const trackElement = track.current;
    const cameraElement = camera.current;
    const panelElement = panel.current;
    if (!trackElement || !cameraElement || !panelElement) return;
    if (!enabled) {
      trackElement.style.height = "";
      cameraElement.style.visibility = "";
      cameraElement.style.zIndex = "";
      cameraElement.inert = false;
      panelElement.style.transform = "";
      panelElement.style.opacity = "";
      panelElement.style.pointerEvents = "";
      return;
    }

    let frame = 0;
    let panelHeight = 0;
    const transition = () => innerHeight * 0.9;
    const measure = () => {
      panelHeight = panelElement.offsetHeight;
      const readingDistance = Math.max(0, panelHeight - innerHeight);
      trackElement.style.height = `${readingDistance + (id === "contact" ? innerHeight : transition())}px`;
    };
    const update = () => {
      const local = scrollY - trackElement.offsetTop;
      const readingDistance = Math.max(0, panelHeight - innerHeight);
      const approaching = Math.max(0, Math.min(1, -local / transition()));
      const leaving = id === "contact" ? 0 : Math.max(0, Math.min(1, (local - readingDistance) / transition()));
      const visible = local > -transition() && (id === "contact" || local < readingDistance + transition());
      const readable = approaching < 0.28 && leaving < 0.35;
      cameraElement.style.visibility = visible ? "visible" : "hidden";
      cameraElement.style.zIndex = local >= 0 ? "12" : "11";
      cameraElement.inert = !readable;
      panelElement.style.pointerEvents = readable ? "auto" : "none";
      panelElement.style.opacity = String(visible ? Math.pow(1 - approaching, 0.65) * Math.max(0, 1 - leaving * 2.7) : 0);
      const z = -approaching * 1650 + leaving * 620;
      const x = (id === "projects" ? -1 : 1) * approaching * 110;
      const y = -Math.max(0, Math.min(readingDistance, local)) + approaching * 55 - leaving * 30;
      const rotate = approaching * (id === "projects" ? -7 : 7) - leaving * 3;
      panelElement.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotate.toFixed(2)}deg)`;
      trackElement.dataset.depth = z.toFixed(0);
      frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = () => { measure(); schedule(); };
    const observer = new ResizeObserver(resize);
    observer.observe(panelElement);
    measure();
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule);
      removeEventListener("resize", resize);
    };
  }, [enabled, id]);

  function keepFocusVisible(event: FocusEvent<HTMLElement>) {
    if (!enabled || !track.current || !panel.current) return;
    const rect = event.target.getBoundingClientRect();
    const delta = rect.bottom > innerHeight - 65 ? rect.bottom - innerHeight + 65 : rect.top < 110 ? rect.top - 110 : 0;
    if (!delta) return;
    const readingDistance = Math.max(0, panel.current.offsetHeight - innerHeight);
    const local = scrollY - track.current.offsetTop;
    window.scrollTo({ top: track.current.offsetTop + Math.max(0, Math.min(readingDistance, local + delta)), behavior: "instant" });
  }

  return <div id={id} ref={track} className={`depth-track ${enabled ? "depth-enabled" : ""}`}>
    <div ref={camera} className="depth-camera">
      <section ref={panel} className={`${className} depth-panel`} aria-label={id === "home" ? "Introduction" : id} onFocusCapture={keepFocusVisible}>
        {children}
      </section>
    </div>
  </div>;
}
