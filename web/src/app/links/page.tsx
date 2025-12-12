import { Suspense } from "react";
import LinksPageClient from "./LinksPageClient";

export default function LinksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen max-w-4xl mx-auto py-12 text-muted-foreground">
          Loading...
        </div>
      }
    >
      <LinksPageClient />
    </Suspense>
  );
}
