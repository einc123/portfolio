"use client";

import { useEffect, useState } from "react";

type Sentence = {
  line1: string;
  line2Before: string;
  accent: string;
  suffix?: string;
};

const SENTENCES: Sentence[] = [
  {
    line1: "I turn briefs into",
    line2Before: "websites that feel ",
    accent: "finished",
  },
  {
    line1: "From first sketch to",
    line2Before: "a site that actually ",
    accent: "ships",
  },
  {
    line1: "Clear layouts.",
    line2Before: "Honest code. ",
    accent: "No fluff",
  },
  {
    line1: "Built for people,",
    line2Before: "not for ",
    accent: "awards pages",
  },
  {
    line1: "Quiet interfaces",
    line2Before: "with work happening ",
    accent: "underneath",
  },
  {
    line1: "Brand on the surface,",
    line2Before: "care in the ",
    accent: "details",
  },
  {
    line1: "Rough ideas in.",
    line2Before: "Working websites ",
    accent: "out",
  },
  {
    line1: "Design that holds up",
    line2Before: "once the novelty ",
    accent: "fades",
  },
  {
    line1: "Sites with room to breathe",
    line2Before: "and a reason to ",
    accent: "exist",
  },
  {
    line1: "Less decoration.",
    line2Before: "More ",
    accent: "decision-making",
  },
  {
    line1: "Made in Dunfermline,",
    line2Before: "shipped wherever you ",
    accent: "need",
  },
  {
    line1: "Useful pages",
    line2Before: "for real clients and ",
    accent: "real deadlines",
  },
  {
    line1: "Type, colour, code —",
    line2Before: "kept in the same ",
    accent: "conversation",
  },
  {
    line1: "I sweat the small stuff",
    line2Before: "so the big picture ",
    accent: "lands",
  },
  {
    line1: "Friendly to use.",
    line2Before: "Stubborn about ",
    accent: "quality",
  },
  {
    line1: "From wireframe to launch",
    line2Before: "without losing the ",
    accent: "plot",
  },
  {
    line1: "Websites that load fast",
    line2Before: "and make sense on a ",
    accent: "phone",
  },
  {
    line1: "Strong first impressions",
    line2Before: "that still work on ",
    accent: "Tuesday",
  },
  {
    line1: "Content first.",
    line2Before: "Chrome ",
    accent: "second",
  },
  {
    line1: "Practical craft",
    line2Before: "for brands that need to ",
    accent: "show up",
  },
  {
    line1: "I build the boring bits",
    line2Before: "so the good bits can ",
    accent: "shine",
  },
  {
    line1: "Careful design",
    line2Before: "with code that stays out of the ",
    accent: "way",
  },
  {
    line1: "Not louder.",
    line2Before: "Just ",
    accent: "clearer",
  },
  {
    line1: "One site, one job —",
    line2Before: "done ",
    accent: "properly",
  },
  {
    line1: "Sketch, build, refine,",
    line2Before: "then hand it over ",
    accent: "clean",
  },
  {
    line1: "Interfaces you can trust",
    line2Before: "on a busy Monday ",
    accent: "morning",
  },
  {
    line1: "Good structure",
    line2Before: "beats clever tricks ",
    accent: "every time",
  },
  {
    line1: "Local roots.",
    line2Before: "Work that ",
    accent: "travels",
  },
  {
    line1: "Pixel care meets",
    line2Before: "server-side ",
    accent: "common sense",
  },
  {
    line1: "Simple on the outside.",
    line2Before: "Sorted ",
    accent: "underneath",
  },
];

const TYPE_MS = 28;
const DELETE_MS = 18;
const HOLD_MS = 10_000;

type Phase = "typing" | "holding" | "deleting";

function sentenceText(sentence: Sentence) {
  return `${sentence.line1} ${sentence.line2Before}${sentence.accent}${sentence.suffix ?? "."}`;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isIntroDone() {
  return document.documentElement.dataset.intro !== "pending";
}

function pickRandom(exclude?: number) {
  if (SENTENCES.length === 1) return 0;
  let next = Math.floor(Math.random() * SENTENCES.length);
  while (next === exclude) {
    next = Math.floor(Math.random() * SENTENCES.length);
  }
  return next;
}

function Headline({
  sentence,
  typed,
  cursor = false,
}: {
  sentence: Sentence;
  typed: number;
  cursor?: boolean;
}) {
  const line1 = sentence.line1;
  const line2Full = `${sentence.line2Before}${sentence.accent}${sentence.suffix ?? "."}`;
  const full = `${line1} ${line2Full}`;
  const visible = full.slice(0, typed);
  const breakAt = line1.length;

  let line1Visible = "";
  let line2Visible = "";
  let showBreak = false;

  if (visible.length <= breakAt) {
    line1Visible = visible;
  } else {
    line1Visible = line1;
    showBreak = true;
    // +1 for the space between line1 and line2 in `full`
    line2Visible = visible.slice(breakAt + 1);
  }

  const accentStart = sentence.line2Before.length;
  const accentEnd = accentStart + sentence.accent.length;
  const before = line2Visible.slice(0, Math.min(line2Visible.length, accentStart));
  const accent = line2Visible.slice(
    Math.min(line2Visible.length, accentStart),
    Math.min(line2Visible.length, accentEnd),
  );
  const after = line2Visible.slice(Math.min(line2Visible.length, accentEnd));

  return (
    <>
      <span className="hero-typewriter__nowrap">{line1Visible}</span>
      {showBreak ? <br /> : null}
      {before}
      {accent ? <em className="text-accent">{accent}</em> : null}
      {after}
      {cursor ? <span className="hero-cursor" /> : null}
    </>
  );
}

function FullHeadline({ sentence }: { sentence: Sentence }) {
  return (
    <>
      <span className="hero-typewriter__nowrap">{sentence.line1}</span>
      <br />
      {sentence.line2Before}
      <em className="text-accent">{sentence.accent}</em>
      {sentence.suffix ?? "."}
    </>
  );
}

export function HeroTypewriter() {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);
  // Stable for SSR + first client paint; randomized after mount.
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");

  const sentence = SENTENCES[index]!;
  const fullLength = sentenceText(sentence).length;

  useEffect(() => {
    const startIndex = pickRandom();
    setIndex(startIndex);
    const startLength = sentenceText(SENTENCES[startIndex]!).length;

    if (prefersReducedMotion()) {
      setReduced(true);
      setTyped(startLength);
      setPhase("holding");
      setReady(true);
      return;
    }

    if (isIntroDone()) {
      setReady(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (isIntroDone()) {
        setReady(true);
        observer.disconnect();
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-intro"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!ready || reduced) return;

    if (phase === "typing") {
      if (typed >= fullLength) {
        const id = window.setTimeout(() => setPhase("holding"), 0);
        return () => window.clearTimeout(id);
      }
      const id = window.setTimeout(() => setTyped((value) => value + 1), TYPE_MS);
      return () => window.clearTimeout(id);
    }

    if (phase === "holding") {
      const id = window.setTimeout(() => setPhase("deleting"), HOLD_MS);
      return () => window.clearTimeout(id);
    }

    if (phase !== "deleting") return;

    if (typed <= 0) {
      const id = window.setTimeout(() => {
        setIndex((current) => pickRandom(current));
        setTyped(0);
        setPhase("typing");
      }, 0);
      return () => window.clearTimeout(id);
    }

    const id = window.setTimeout(() => setTyped((value) => value - 1), DELETE_MS);
    return () => window.clearTimeout(id);
  }, [ready, reduced, phase, typed, fullLength]);

  return (
    <h1 className="reveal reveal-delay-1 relative mt-5 max-w-4xl font-display text-[clamp(2.6rem,11vw,6.5rem)] leading-[0.95] tracking-tight text-ink sm:mt-6">
      <span className="sr-only">{sentenceText(sentence)}</span>

      {/* Invisible stack of every line — height stays at the tallest sentence */}
      <span className="invisible grid" aria-hidden="true">
        {SENTENCES.map((item, i) => (
          <span key={i} className="col-start-1 row-start-1">
            <FullHeadline sentence={item} />
          </span>
        ))}
      </span>

      <span className="absolute inset-0" aria-hidden="true">
        <Headline
          sentence={sentence}
          typed={reduced ? fullLength : typed}
          cursor={!reduced && phase !== "holding"}
        />
      </span>
    </h1>
  );
}
