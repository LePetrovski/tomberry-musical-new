import { organizationSchema, webSiteSchema } from "@/lib/seo/schemas";
import { JsonLd } from "./JsonLd";

export function GlobalJsonLd() {
  return <JsonLd data={[organizationSchema(), webSiteSchema()]} />;
}
