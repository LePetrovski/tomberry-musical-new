import { CurtainLink } from "@/components/navigation/CurtainLink";
import { breadcrumbListSchema, type BreadcrumbItem } from "@/lib/seo/schemas";
import { JsonLd } from "./JsonLd";

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function Breadcrumbs({ items, className }: Props) {
  if (items.length === 0) {
    return null;
  }

  return (
    <>
        <JsonLd data={breadcrumbListSchema(items)} />
        <nav aria-label="Fil d'Ariane" className={className + " crt-glass w-fit max-w-full rounded-xl px-3 py-1.5"}>
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-secondary-600">
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                <li key={`${item.label}-${index}`} className="flex min-w-0 max-w-full items-center gap-1.5 [overflow-wrap:anywhere]">
                    {index > 0 && (
                    <span aria-hidden="true" className="text-secondary-300">
                        /
                    </span>
                    )}
                    {item.href && !isLast ? (
                    <CurtainLink
                        href={item.href}
                        className="transition-colors hover:text-secondary-900"
                    >
                        {item.label}
                    </CurtainLink>
                    ) : (
                    <span aria-current="page" className="font-medium text-secondary-700">
                        {item.label}
                    </span>
                    )}
                </li>
                );
            })}
            </ol>
        </nav>
    </>
  );
}

export type { BreadcrumbItem };
