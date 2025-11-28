import LinkList from "@/components/LinkList";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto">
      <header className="mb-10 text-center md:text-left border-b border-border/40 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
          QuickLinks
        </h1>
      </header>

      <LinkList />
    </main>
  );
}
