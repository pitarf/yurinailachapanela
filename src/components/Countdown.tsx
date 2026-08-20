'use client';

import { useEffect, useState } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setIsFinished(true);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      if (remaining === null) {
        clearInterval(timer);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) {
    if (isFinished) {
      return (
        <div className="text-center font-serif text-2xl tracking-widest text-brand-black/40">
          O GRANDE DIA CHEGOU
        </div>
      );
    }
    // Estado de carregamento elegante
    return (
      <div className="flex justify-center space-x-8 animate-pulse text-brand-black/20">
        {['DIAS', 'HORAS', 'MIN', 'SEG'].map((label) => (
          <div key={label} className="text-center">
            <div className="font-serif text-4xl md:text-6xl font-light">00</div>
            <div className="text-xs tracking-widest mt-2">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center gap-4 sm:gap-8 md:gap-12 select-none">
      {[
        { value: timeLeft.days, label: 'DIAS' },
        { value: timeLeft.hours, label: 'HORAS' },
        { value: timeLeft.minutes, label: 'MIN' },
        { value: timeLeft.seconds, label: 'SEG' },
      ].map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <div className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight tracking-tight text-zinc-900 dark:text-white">
            {item.value.toString().padStart(2, '0')}
          </div>
          <div className="text-[8px] sm:text-[10px] md:text-xs tracking-widest font-sans uppercase text-zinc-400 mt-1 sm:mt-2">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
