"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };

function canUseCustomCursor() {
  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hovering, setHovering] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const point = useRef<Point>({ x: 0, y: 0 });
  const frame = useRef(0);

  useEffect(() => {
    function syncEnabled() {
      const next = canUseCustomCursor();
      setEnabled(next);
      document.documentElement.classList.toggle("has-custom-cursor", next);
      if (!next) {
        setVisible(false);
        setPressed(false);
      }
    }

    syncEnabled();

    const fineQuery = window.matchMedia("(pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    fineQuery.addEventListener("change", syncEnabled);
    motionQuery.addEventListener("change", syncEnabled);

    return () => {
      fineQuery.removeEventListener("change", syncEnabled);
      motionQuery.removeEventListener("change", syncEnabled);
      document.documentElement.classList.remove("has-custom-cursor");
      window.cancelAnimationFrame(frame.current);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;

    function render() {
      const el = dotRef.current;
      if (el) {
        el.style.transform = `translate3d(${point.current.x}px, ${point.current.y}px, 0)`;
      }
      frame.current = 0;
    }

    function onPointerMove(event: PointerEvent) {
      point.current = { x: event.clientX, y: event.clientY };
      setVisible(true);

      const target = event.target;
      if (target instanceof Element) {
        setHovering(Boolean(target.closest("a, button, [role='button'], input, textarea, select, label, summary")));
      }

      if (!frame.current) {
        frame.current = window.requestAnimationFrame(render);
      }
    }

    function onPointerDown(event: PointerEvent) {
      if (event.pointerType !== "mouse") return;
      point.current = { x: event.clientX, y: event.clientY };
      setPressed(true);
      setVisible(true);
      if (!frame.current) {
        frame.current = window.requestAnimationFrame(render);
      }
    }

    function onPointerUp() {
      setPressed(false);
    }

    function onPointerLeave() {
      setVisible(false);
      setPressed(false);
      setHovering(false);
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    window.addEventListener("pointercancel", onPointerUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      window.cancelAnimationFrame(frame.current);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={dotRef}
      className={`custom-cursor ${visible ? "is-visible" : ""} ${pressed ? "is-pressed" : ""} ${hovering ? "is-hovering" : ""}`}
      aria-hidden
    >
      <span className="custom-cursor__dot" />
      <span className="custom-cursor__ring" />
    </div>
  );
}
