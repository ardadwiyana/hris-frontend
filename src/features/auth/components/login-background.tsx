// Abstract, on-theme backdrop for the login screen: soft ribbon shapes and
// a partial accent ring, echoing a layered "product hero" feel without
// depicting anything app-specific — the card in front carries the content.
export function LoginBackground() {
  return (
    <svg
      viewBox="0 0 960 960"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="loginBgBase" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0f2b26" />
          <stop offset="55%" stopColor="#0a5646" />
          <stop offset="100%" stopColor="#0e6e5a" />
        </linearGradient>
        <radialGradient id="loginBgSpot" cx="50%" cy="42%" r="55%">
          <stop offset="0%" stopColor="#1f9d7f" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1f9d7f" stopOpacity="0" />
        </radialGradient>
        <filter id="loginBgBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect width="960" height="960" fill="url(#loginBgBase)" />
      <rect width="960" height="960" fill="url(#loginBgSpot)" />

      <g opacity="0.5" filter="url(#loginBgBlur)">
        <path
          d="M-40 260 C 120 210, 200 330, 340 290 S 560 190, 700 260"
          stroke="#cfe6df"
          strokeOpacity="0.35"
          strokeWidth="34"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M120 780 C 260 700, 340 840, 480 780 S 720 660, 900 760"
          stroke="#2f8a72"
          strokeOpacity="0.4"
          strokeWidth="40"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M560 60 C 660 140, 640 240, 760 260 S 960 220, 1020 300"
          stroke="#ffffff"
          strokeOpacity="0.12"
          strokeWidth="26"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Partial accent ring, top-center */}
      <g transform="translate(480 150)">
        <circle r="42" fill="none" stroke="#ffffff" strokeOpacity="0.14" strokeWidth="10" />
        <path
          d="M 0 -42 A 42 42 0 0 1 40 8"
          fill="none"
          stroke="#3fc3a0"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
