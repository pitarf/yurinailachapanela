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
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() => calculateTimeLeft(targetDate));
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

  const displayTime = timeLeft || {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  const isFinished = mounted && !timeLeft;

  if (isFinished) {
    return (
      <div className="text-center font-serif text-xl sm:text-2xl tracking-widest text-zinc-800">
        O GRANDE DIA CHEGOU! 🎉
      </div>
    );
  }

  const items = [
    { value: displayTime.days, label: 'DIAS' },
    { value: displayTime.hours, label: 'HORAS' },
    { value: displayTime.minutes, label: 'MIN' },
    { value: displayTime.seconds, label: 'SEG' },
  ];

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-4 md:gap-6 select-none w-full max-w-md mx-auto">
      {items.map((item) => (
        <div
          key={item.label}
          className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl py-2 px-1 sm:p-3 flex flex-col items-center justify-center shadow-xs"
        >
          <div className="font-serif text-xl sm:text-3xl md:text-4xl font-normal tracking-tight text-zinc-900 dark:text-white tabular-nums">
            {item.value.toString().padStart(2, '0')}
          </div>
          <div className="text-[8px] sm:text-[9px] tracking-widest font-sans uppercase font-semibold text-zinc-400 dark:text-zinc-500 mt-0.5">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
