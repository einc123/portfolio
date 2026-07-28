import { accentVar, getHighlightTerms, splitHighlightedText } from "@/lib/caseStudyTheme";
import type { Project } from "@/lib/data";

export function HighlightedCopy({
  text,
  project,
  className = "",
}: {
  text: string;
  project: Project;
  className?: string;
}) {
  const terms = getHighlightTerms(project);
  const parts = splitHighlightedText(text, terms);
  let colourIndex = 0;

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part.highlight) {
          return <span key={`${part.text}-${index}`}>{part.text}</span>;
        }

        const colour = accentVar(colourIndex);
        colourIndex += 1;

        return (
          <span
            key={`${part.text}-${index}`}
            className="font-medium"
            style={{ color: colour }}
          >
            {part.text}
          </span>
        );
      })}
    </span>
  );
}
