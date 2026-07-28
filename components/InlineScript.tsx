/**
 * Inline boot script that runs during HTML parse (before paint).
 * Keep this as a Server Component so the script is present in the initial HTML
 * and actually executes. (A Client Component helper that switched to text/plain
 * left homepage content stuck at opacity 0 when boot never ran.)
 * @see https://nextjs.org/docs/app/guides/preventing-flash-before-hydration
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      // Prefer a working boot path over silencing React's script-in-tree warning.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
