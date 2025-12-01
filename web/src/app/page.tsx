import LinkList from "@/components/LinkList";
import AppHeader from "@/components/layouts/AppHeader";

export default function Home() {
  return (
    <main className="min-h-screen max-w-4xl mx-auto">
      <AppHeader />
      <LinkList />
    </main>
  );
}
