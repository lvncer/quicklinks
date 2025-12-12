"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

type ScrollOffset =
  NonNullable<Parameters<typeof useScroll>[0]> extends {
    offset?: infer T;
  }
    ? T
    : never;

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * スクロールに対する発火範囲。
   * 0〜1 で指定（要素がスクロール領域に入ってからの進捗）。
   */
  range?: [number, number];
  /**
   * range の開始を遅らせる（=遅延っぽくする）ためのオフセット。
   * 0〜1。例: 0.08
   */
  shift?: number;
  /**
   * 初期オフセット(px)
   */
  y?: number;
  /**
   * スクロール追従をゆっくりにするためのスプリング設定
   */
  spring?: { stiffness?: number; damping?: number; mass?: number };
  /**
   * useScroll の offset を上書きしたい場合に指定
   * 例: ["start 90%", "start 55%"]
   */
  offset?: ScrollOffset;
};

export default function ScrollReveal({
  children,
  className,
  range = [0.15, 0.55],
  shift = 0,
  y = 18,
  spring,
  offset,
}: ScrollRevealProps) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset ?? (["start 85%", "start 35%"] as ScrollOffset),
  });

  const start = Math.min(1, Math.max(0, range[0] + shift));
  const end = Math.min(1, Math.max(0, range[1] + shift));
  const safeEnd = end <= start ? Math.min(1, start + 0.01) : end;

  const p = useSpring(scrollYProgress, {
    stiffness: spring?.stiffness ?? 110,
    damping: spring?.damping ?? 20,
    mass: spring?.mass ?? 1,
  });

  const opacity = useTransform(p, [start, safeEnd], [0, 1]);
  const translateY = useTransform(p, [start, safeEnd], [y, 0]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ opacity, y: translateY }}
    >
      {children}
    </motion.div>
  );
}
