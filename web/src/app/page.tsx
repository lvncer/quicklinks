import { Suspense } from "react";
import AppHeader from "@/components/layouts/AppHeader";
import LinksPageClient from "@/components/links/LinksPageClient";

export default function Home() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <AppHeader />
      <Suspense>
        <LinksPageClient />
      </Suspense>
    </main>
  );
}
