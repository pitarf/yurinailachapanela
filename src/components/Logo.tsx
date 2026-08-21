import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'monogram' | 'symbol' | 'navbar';
  size?: number;
}

export default function Logo({ className = '', variant = 'full', size = 200 }: LogoProps) {
  if (variant === 'navbar') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image
          src="/logonavbar.jpeg"
          alt="Logo Naila & Yuri"
          width={size}
          height={size}
          className="object-contain dark:invert w-auto h-auto max-h-10"
          priority
        />
      </div>
    );
  }

  if (variant === 'monogram') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image
          src="/monograma_popyn.png"
          alt="Monograma Naila & Yuri"
          width={size}
          height={size}
          className="object-contain dark:invert w-auto h-auto"
          priority
        />
      </div>
    );
  }

  if (variant === 'symbol') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image
          src="/SIMBOL_POP_BLACK.png"
          alt="Símbolo Popyn Naila & Yuri"
          width={size}
          height={size}
          className="object-contain dark:invert w-auto h-auto"
          priority
        />
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Image
        src="/logocompleta_yn.png"
        alt="Logo Naila & Yuri"
        width={size}
        height={Math.round(size / 2)}
        className="object-contain dark:invert w-auto h-auto"
        priority
      />
    </div>
  );
}
