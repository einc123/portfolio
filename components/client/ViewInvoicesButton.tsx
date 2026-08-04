import Link from "next/link";

export function ViewInvoicesButton({
  className = "inline-flex min-h-11 items-center justify-center border border-line bg-background/80 px-5 py-2.5 text-sm text-ink transition-colors hover:border-accent/40",
}: {
  className?: string;
}) {
  return (
    <Link href="/client/invoices" className={className}>
      View invoices
    </Link>
  );
}
