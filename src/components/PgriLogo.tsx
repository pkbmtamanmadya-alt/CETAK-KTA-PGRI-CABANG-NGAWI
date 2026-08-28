import React from 'react';

interface PgriLogoProps {
  className?: string;
  size?: number;
}

export const PgriLogo: React.FC<PgriLogoProps> = ({ className = 'w-10 h-10', size }) => {
  const style = size ? { width: size, height: size } : undefined;

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 rounded-full select-none ${className}`}
      style={style}
      title="Persatuan Guru Republik Indonesia (PGRI)"
    >
      <svg
        viewBox="0 0 500 500"
        className="w-full h-full drop-shadow-xs"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Red Ring */}
        <circle cx="250" cy="250" r="240" fill="#E11D2A" stroke="#FFFFFF" strokeWidth="8" />
        <circle cx="250" cy="250" r="236" stroke="#C8101E" strokeWidth="4" fill="none" />

        {/* Circular Outer Text "PERSATUAN GURU REPUBLIK INDONESIA" */}
        <defs>
          <path
            id="pgriTopTextPath"
            d="M 60,250 A 190,190 0 1,1 440,250"
            fill="none"
          />
          <path
            id="pgriBottomTextPath"
            d="M 440,250 A 190,190 0 0,1 60,250"
            fill="none"
          />
        </defs>

        <text fill="#FFFFFF" fontSize="33" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="4.5">
          <textPath href="#pgriTopTextPath" startOffset="50%" textAnchor="middle">
            PERSATUAN GURU REPUBLIK INDONESIA
          </textPath>
        </text>

        <text fill="#FFFFFF" fontSize="42" fontWeight="900" fontFamily="Arial, Helvetica, sans-serif" letterSpacing="8">
          <textPath href="#pgriBottomTextPath" startOffset="50%" textAnchor="middle">
            ★ PGRI ★
          </textPath>
        </text>

        {/* Inner Green Circle */}
        <circle cx="250" cy="250" r="162" fill="#0D8A3F" stroke="#FFFFFF" strokeWidth="6" />

        {/* 4 Pillars / Books on Left & Right */}
        {/* Left Pillars */}
        <g fill="#FFFFFF">
          <rect x="145" y="200" width="12" height="110" rx="3" />
          <rect x="162" y="200" width="12" height="110" rx="3" />
          <rect x="142" y="260" width="35" height="7" rx="2" />
          <rect x="142" y="280" width="35" height="7" rx="2" />
          <rect x="142" y="300" width="35" height="7" rx="2" />
        </g>

        {/* Right Pillars */}
        <g fill="#FFFFFF">
          <rect x="325" y="200" width="12" height="110" rx="3" />
          <rect x="342" y="200" width="12" height="110" rx="3" />
          <rect x="322" y="260" width="35" height="7" rx="2" />
          <rect x="322" y="280" width="35" height="7" rx="2" />
          <rect x="322" y="300" width="35" height="7" rx="2" />
        </g>

        {/* Center Opened Book Base */}
        <g fill="#FFFFFF">
          <path d="M 185,260 Q 250,250 315,260 L 315,310 Q 250,300 185,310 Z" fill="#FFFFFF" />
          <line x1="250" y1="252" x2="250" y2="308" stroke="#0D8A3F" strokeWidth="4" />
          <line x1="195" y1="272" x2="242" y2="270" stroke="#0D8A3F" strokeWidth="2.5" />
          <line x1="195" y1="284" x2="242" y2="282" stroke="#0D8A3F" strokeWidth="2.5" />
          <line x1="195" y1="296" x2="242" y2="294" stroke="#0D8A3F" strokeWidth="2.5" />
          <line x1="258" y1="270" x2="305" y2="272" stroke="#0D8A3F" strokeWidth="2.5" />
          <line x1="258" y1="282" x2="305" y2="284" stroke="#0D8A3F" strokeWidth="2.5" />
          <line x1="258" y1="294" x2="305" y2="296" stroke="#0D8A3F" strokeWidth="2.5" />
        </g>

        {/* Center Torch (Suluh Api) */}
        {/* Flames (Nyala Api) */}
        <path
          d="M 250,115 C 220,150 200,180 200,205 C 200,225 215,238 235,238 C 240,238 245,236 250,232 C 255,236 260,238 265,238 C 285,238 300,225 300,205 C 300,180 280,150 250,115 Z"
          fill="#E11D2A"
          stroke="#FFFFFF"
          strokeWidth="5"
        />
        {/* Flame core */}
        <path
          d="M 250,145 C 235,170 220,185 220,202 C 220,215 230,222 242,222 C 246,222 248,220 250,218 C 252,220 254,222 258,222 C 270,222 280,215 280,202 C 280,185 265,170 250,145 Z"
          fill="#FFDE00"
        />

        {/* Torch Handle & Crown (Tangkai Suluh Kuning) */}
        <g fill="#FFD700" stroke="#FFFFFF" strokeWidth="4">
          {/* Torch Crown */}
          <rect x="205" y="235" width="90" height="28" rx="8" />
          <line x1="220" y1="240" x2="220" y2="258" stroke="#B8860B" strokeWidth="3" />
          <line x1="235" y1="240" x2="235" y2="258" stroke="#B8860B" strokeWidth="3" />
          <line x1="250" y1="240" x2="250" y2="258" stroke="#B8860B" strokeWidth="3" />
          <line x1="265" y1="240" x2="265" y2="258" stroke="#B8860B" strokeWidth="3" />
          <line x1="280" y1="240" x2="280" y2="258" stroke="#B8860B" strokeWidth="3" />

          {/* Torch Shaft */}
          <path d="M 218,263 L 228,360 Q 250,380 272,360 L 282,263 Z" />
          <line x1="238" y1="270" x2="242" y2="350" stroke="#B8860B" strokeWidth="3" />
          <line x1="250" y1="270" x2="250" y2="355" stroke="#B8860B" strokeWidth="3" />
          <line x1="262" y1="270" x2="258" y2="350" stroke="#B8860B" strokeWidth="3" />
        </g>
      </svg>
    </div>
  );
};
