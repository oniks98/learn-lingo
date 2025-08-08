'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export default function AnimatedCounter({
  value,
  duration = 2000,
  suffix = '',
  className = '',
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 },
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easeOutExpo,
      );
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isVisible, value, duration]);

  const formatNumber = (num: number) => num.toLocaleString('en-US');

  return (
    <p ref={counterRef} className={className}>
      {formatNumber(count)}
      {suffix}
    </p>
  );
}
