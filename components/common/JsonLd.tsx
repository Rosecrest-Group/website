// Renders one or more JSON-LD blocks into the page.
// Safe to use in server components.
//
// Usage:
//   <JsonLd data={buildService({ ... })} />
//   <JsonLd data={[buildWebPage(...), buildFAQPage(...)]} />

interface JsonLdProps {
  data: object | object[];
  id?: string;
}

export default function JsonLd({ data, id }: JsonLdProps) {
  const blocks = Array.isArray(data) ? data : [data];

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={`${id ?? "ld"}-${i}`}
          type="application/ld+json"
          // Safe: schema objects are constructed server-side from typed data,
          // never from user input. Using dangerouslySetInnerHTML to avoid React
          // escaping characters that break JSON-LD parsers.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}