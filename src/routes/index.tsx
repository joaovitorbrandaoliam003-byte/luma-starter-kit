import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luma Dental Studio" },
      { name: "description", content: "Luma Dental Studio" },
      { property: "og:title", content: "Luma Dental Studio" },
      { property: "og:description", content: "Luma Dental Studio" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <span className="text-sm text-muted-foreground">Luma Dental Studio</span>
    </div>
  );
}
