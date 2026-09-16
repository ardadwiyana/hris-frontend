export function LoginIllustration() {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-md"
      role="img"
      aria-label="Ilustrasi manajemen tim dan kehadiran karyawan"
    >
      <defs>
        <linearGradient id="loginCardGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E1F5EC" />
          <stop offset="100%" stopColor="#A9E2C4" />
        </linearGradient>
      </defs>

      {/* Floating backdrop shapes */}
      <circle cx="60" cy="340" r="70" fill="#E1F5EC" opacity="0.6" />
      <circle cx="420" cy="60" r="50" fill="#6BC79A" opacity="0.35" />

      {/* Main card: schedule / attendance sheet */}
      <rect x="80" y="60" width="260" height="300" rx="22" fill="#FFFFFF" stroke="#DCEDE3" strokeWidth="2" />
      <rect x="80" y="60" width="260" height="56" rx="22" fill="url(#loginCardGrad)" />
      <rect x="106" y="82" width="90" height="12" rx="6" fill="#1F8054" />
      <circle cx="316" cy="88" r="10" fill="#FFFFFF" />
      <path d="M311 88l3 3 6-6" stroke="#57A65B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Rows representing attendance/employee entries */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(106 ${142 + i * 48})`}>
          <circle cx="12" cy="12" r="12" fill={i % 2 === 0 ? "#E1F5EC" : "#EAF3FB"} />
          <rect x="34" y="4" width="120" height="8" rx="4" fill="#2A332D" opacity="0.75" />
          <rect x="34" y="18" width="76" height="6" rx="3" fill="#66756D" opacity="0.5" />
          <rect x="176" y="6" width="42" height="14" rx="7" fill={i === 2 ? "#FBF1DE" : "#E9F5E9"} />
        </g>
      ))}

      {/* Floating avatar cluster (team) */}
      <g transform="translate(340 210)">
        <circle cx="0" cy="0" r="34" fill="#2FA36B" />
        <circle cx="46" cy="-18" r="24" fill="#6BC79A" />
        <circle cx="46" cy="30" r="20" fill="#76A9D8" opacity="0.85" />
      </g>

      {/* Small floating check badge */}
      <g transform="translate(56 74)">
        <circle cx="0" cy="0" r="22" fill="#57A65B" />
        <path d="M-8 0l5 5 11-11" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
