import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto">
      <header className="mb-12 text-center md:text-left">
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-5 w-32" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 h-[200px] flex flex-col"
          >
            <div className="flex justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-6 w-3/4 mb-auto" />
            <div className="flex justify-between items-center mt-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
