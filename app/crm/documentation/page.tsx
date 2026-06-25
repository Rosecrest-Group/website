import ApiDocumentation from "@/crm/components/ApiDocumentation";

export const metadata = {
  title: "API Documentation — Rosecrest",
  description: "Submit leads to the Rosecrest CRM via the third-party intake API.",
};

export default function DocumentationPage() {
  return <ApiDocumentation />;
}
