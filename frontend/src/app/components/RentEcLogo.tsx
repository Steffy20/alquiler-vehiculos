type RentEcLogoProps = {
  compact?: boolean;
  className?: string;
};

export function RentEcLogo({ compact = false, className = "" }: RentEcLogoProps) {
  const iconSize = compact ? "w-11 h-9" : "w-24 h-16";
  const brandSize = compact ? 18 : 23;
  const subtitleSize = compact ? 7 : 9;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`${iconSize} rounded-xl bg-[#12121a] border border-[#c9a84c]/30 shadow-[0_0_22px_rgba(201,168,76,0.12)] overflow-hidden flex items-center justify-center`}>
        <svg viewBox="0 0 180 120" className="w-full h-full" aria-hidden="true">
          <path d="M42 48C58 16 119 13 147 35" fill="none" stroke="#c9a84c" strokeWidth="10" strokeLinecap="round" />
          <path d="M147 35C154 41 158 48 160 56" fill="none" stroke="#164a9b" strokeWidth="10" strokeLinecap="round" />
          <path d="M160 56C163 65 162 74 158 82" fill="none" stroke="#d4183d" strokeWidth="10" strokeLinecap="round" />
          <path d="M20 73L58 35L87 71H20Z" fill="#071827" />
          <path d="M53 40L60 54L67 47L74 66L61 54L54 63L47 55Z" fill="#f0ede8" />
          <path d="M83 70L104 46L128 70H83Z" fill="#0f2638" />
          <path d="M109 68V37H116V68M123 68V43H131V68M137 68V52H147V68" stroke="#0b2030" strokeWidth="7" strokeLinecap="round" />
          <path d="M109 43H116M123 50H131M137 58H147" stroke="#f0ede8" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
          <path d="M21 76C38 84 50 94 55 108" fill="none" stroke="#071827" strokeWidth="18" strokeLinecap="round" />
          <path d="M31 79C42 86 49 95 51 104" fill="none" stroke="#f0ede8" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
          <path d="M50 80C61 65 120 64 139 80C151 81 158 88 161 98H42C43 90 45 84 50 80Z" fill="#f0ede8" />
          <path d="M65 78C77 69 111 70 126 80H65Z" fill="#1a1a24" opacity="0.92" />
          <path d="M132 81L146 84L153 92H133Z" fill="#1a1a24" opacity="0.9" />
          <path d="M52 96H154" stroke="#c9a84c" strokeWidth="6" strokeLinecap="round" />
          <circle cx="69" cy="97" r="8" fill="#0a0a0f" stroke="#f0ede8" strokeWidth="3" />
          <circle cx="132" cy="97" r="8" fill="#0a0a0f" stroke="#f0ede8" strokeWidth="3" />
        </svg>
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: brandSize, color: "#f0ede8", letterSpacing: "0.06em", lineHeight: 1 }}>
            RENT
          </span>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: brandSize, color: "#c9a84c", letterSpacing: "0.06em", lineHeight: 1 }}>
            EC
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="h-px w-5 bg-[#c9a84c]" />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: subtitleSize, color: "#7a7890", letterSpacing: "0.22em", fontWeight: 700, whiteSpace: "nowrap" }}>
            ALQUILER DE VEHÍCULOS
          </span>
        </div>
      </div>
    </div>
  );
}
