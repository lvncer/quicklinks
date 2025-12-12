import { Button } from "../ui/button";
import Link from "next/link";

export default function WebHeader() {
  return (
    <header className="py-6 px-4 md:px-8 max-w-7xl mx-auto w-full flex justify-between items-center">
      <Link href="/" className="text-xl font-bold tracking-tight text-primary">
        QuickLinks
      </Link>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/sign-up">無料で始める</Link>
        </Button>
      </div>
    </header>
  );
}
