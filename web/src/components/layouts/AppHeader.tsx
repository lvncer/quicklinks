"use client";

import { UserButton } from "@clerk/nextjs";

export default function AppHeader() {
  return (
    <header className="py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-primary">
          QuickLinks
        </h1>
        <UserButton />
      </div>
    </header>
  );
}
