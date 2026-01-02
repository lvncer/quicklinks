"use client";

import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { ModeToggle } from "../theme-toggle";

export default function WebHeader() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && (resolvedTheme === "dark" || theme === "dark");

  return (
    <header className="py-6 px-4 md:px-8 max-w-7xl mx-auto w-full flex justify-between items-center">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src={isDark ? "/images/clip-white.png" : "/images/clip-black.png"}
          alt="clipgest icon"
          width={24}
          height={24}
          className="w-6 h-6 md:w-10 md:h-10"
          priority
        />
        <Image
          src="/images/CLIPGEST.png"
          alt="clipgest"
          width={80}
          height={24}
          className="h-4 md:h-6 w-auto"
          priority
        />
      </Link>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/sign-up">無料で始める</Link>
        </Button>
        <ModeToggle />
      </div>
    </header>
  );
}
