"use client";

import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "../theme-toggle";

export default function AppHeader() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <header className="py-12">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image
            src={isDark ? "/images/clip-white.png" : "/images/clip-black.png"}
            alt="clipgest icon"
            width={40}
            height={40}
            className="w-10 h-10"
            priority
          />
        </Link>
        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
