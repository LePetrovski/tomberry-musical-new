import { organizationSchema, podcastSeriesSchema, webSiteSchema } from "@/lib/seo/schemas";
import { JsonLd } from "./JsonLd";

type Props = {
  sameAs?: string[];
};

export function GlobalJsonLd({ sameAs = [] }: Props) {
  return (
    <JsonLd data={[organizationSchema({ sameAs }), webSiteSchema({ sameAs }), podcastSeriesSchema({ sameAs })]} />
  );
}
