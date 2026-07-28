import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, type BreadcrumbItem } from "@/lib/seo";

export function Breadcrumbs({
  items,
  className = "",
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(items)} />
      <nav aria-label="Breadcrumb" className={className}>
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] uppercase tracking-[0.16em] text-faint">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.path} className="inline-flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden className="text-line">
                    /
                  </span>
                ) : null}
                {isLast ? (
                  <span aria-current="page" className="text-muted">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.path}
                    className="link-underline transition-colors hover:text-ink"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
