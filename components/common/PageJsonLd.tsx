import JsonLd from "@/components/common/JsonLd";
import { buildPageSchema } from "@/lib/schema";

/** Structured data for a page listed in `pageMetadata`. */
export default function PageJsonLd({ path }: { path: string }) {
  return <JsonLd data={buildPageSchema(path)} id="page" />;
}
