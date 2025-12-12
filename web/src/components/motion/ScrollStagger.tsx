"use client";

import * as React from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

type ScrollOffset =
  NonNullable<Parameters<typeof useScroll>[0]> extends {
    offset?: infer T;
  }
    ? T
    : never;

type ScrollStaggerProps = {
  children: React.ReactNode;
  className?: string;
  /**
   * 子要素の開始タイミングをずらす量（疑似delay）
   */
  step?: number;
  /**
   * 子要素の初期オフセット(px)
   */
  y?: number;
  /**
   * 全体の発火範囲（0〜1）
   */
  range?: [number, number];
  spring?: { stiffness?: number; damping?: number; mass?: number };
  /**
   * useScroll の offset を上書きしたい場合に指定
   * 例: ["start 95%", "start 65%"]
   */
  offset?: ScrollOffset;
};

export function ScrollStagger({
  children,
  className,
  step = 0.08,
  y = 16,
  range = [0.12, 0.62],
  spring,
  offset,
}: ScrollStaggerProps) {
  const reduced = useReducedMotion();
  const ref = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset ?? (["start 85%", "start 35%"] as ScrollOffset),
  });

  const p = useSpring(scrollYProgress, {
    stiffness: spring?.stiffness ?? 105,
    damping: spring?.damping ?? 20,
    mass: spring?.mass ?? 1.05,
  });

  const childArray = React.Children.toArray(children);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      {childArray.map((child, i) => {
        return (
          <ScrollStaggerItem
            // children の順序が重要なので index を key にしてOK（静的セクション想定）
            key={i}
            progress={p}
            index={i}
            step={step}
            range={range}
            y={y}
          >
            {child}
          </ScrollStaggerItem>
        );
      })}
    </div>
  );
}

type ScrollStaggerItemProps = {
  children: React.ReactNode;
  progress: MotionValue<number>;
  index: number;
  step: number;
  range: [number, number];
  y: number;
};

function ScrollStaggerItem({
  children,
  progress,
  index,
  step,
  range,
  y,
}: ScrollStaggerItemProps) {
  const shift = step * index;
  const start = Math.min(1, Math.max(0, range[0] + shift));
  const end = Math.min(1, Math.max(0, range[1] + shift));
  const safeEnd = end <= start ? Math.min(1, start + 0.01) : end;

  const opacity = useTransform(progress, [start, safeEnd], [0, 1]);
  const translateY = useTransform(progress, [start, safeEnd], [y, 0]);

  return <motion.div style={{ opacity, y: translateY }}>{children}</motion.div>;
}
