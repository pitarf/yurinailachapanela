import Image from 'next/image';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'monogram' | 'symbol';
  size?: number;
}

export default function Logo({ className = '', variant = 'full', size = 200 }: LogoProps) {
  if (variant === 'monogram') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <Image
          src="/monograma_popyn.png"
          alt="Monograma Naila & Yuri"
          width={size}
          height={size}
          className="object-contain dark:invert"
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
          className="object-contain dark:invert"
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
        height={size / 2}
        className="object-contain dark:invert"
        priority
      />
    </div>
  );
}
