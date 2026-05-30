import { getEmailTemplates } from "@/lib/queries/templates";
import { TemplatesView } from "@/components/templates/templates-view";

export default async function TemplatesPage() {
  const templates = await getEmailTemplates();
  return <TemplatesView templates={templates} />;
}
