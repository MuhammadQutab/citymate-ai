/** CityMate mark: a location pin whose head is a friendly face, with a mint signal arc. */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path
        d="M20 37c-.6 0-1.2-.3-1.5-.8C14.3 30.4 8 23.6 8 16.5 8 9.6 13.4 4 20 4s12 5.6 12 12.5c0 7.1-6.3 13.9-10.5 19.7-.3.5-.9.8-1.5.8Z"
        fill="#ff7a66"
      />
      <circle cx="20" cy="16.5" r="7.5" fill="#14123a" />
      <circle cx="17.3" cy="15.6" r="1.3" fill="#3df2c2" />
      <circle cx="22.7" cy="15.6" r="1.3" fill="#3df2c2" />
      <path d="M17 19c1.7 1.5 4.3 1.5 6 0" stroke="#3df2c2" strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M31.5 5.5a10 10 0 0 1 3 6.5" stroke="#3df2c2" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-lg font-bold tracking-tight text-pearl-50">
        CityMate<span className="text-mint-400"> AI</span>
      </span>
    </span>
  );
}
