'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const difference = +new Date(targetDate) - +new Date();
  if (difference <= 0) return null;

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateCountdown = () => {
      setTimeLeft(calculateTimeLeft(targetDate));
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return (
      <div className="inline-flex items-center gap-2 sm:gap-3 py-1 text-zinc-400 select-none" suppressHydrationWarning>
        <span className="text-[9px] sm:text-[10px] tracking-widest font-sans uppercase text-zinc-400 font-semibold mr-1">
          Faltam:
        </span>
        <span className="font-serif text-sm sm:text-base font-light text-zinc-400">
          Carregando contagem...
        </span>
      </div>
    );
  }

  const isFinished = !timeLeft;

  if (isFinished) {
    return (
      <span className="text-xs sm:text-sm font-sans font-semibold tracking-wider text-zinc-800 uppercase">
        O Grande Dia Chegou! 🎉
      </span>
    );
  }

  const items = [
    { value: timeLeft.days, label: 'dias' },
    { value: timeLeft.hours, label: 'horas' },
    { value: timeLeft.minutes, label: 'min' },
    { value: timeLeft.seconds, label: 'seg' },
  ];

  return (
    <div className="inline-flex items-center gap-2 sm:gap-3 py-1 text-zinc-600 select-none" suppressHydrationWarning>
      <span className="text-[9px] sm:text-[10px] tracking-widest font-sans uppercase text-zinc-400 font-semibold mr-1">
        Faltam:
      </span>
      {items.map((item, idx) => (
        <div key={item.label} className="inline-flex items-baseline gap-0.5">
          <span className="font-serif text-base sm:text-lg font-medium text-zinc-900 tabular-nums" suppressHydrationWarning>
            {item.value.toString().padStart(2, '0')}
          </span>
          <span className="text-[9px] font-sans text-zinc-400 font-normal">
            {item.label}
          </span>
          {idx < items.length - 1 && (
            <span className="text-zinc-300 ml-1 text-xs select-none">•</span>
          )}
        </div>
      ))}
    </div>
  );
}
