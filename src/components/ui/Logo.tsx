export function Logo({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Orange background with rounded corners */}
      <rect width="100" height="100" rx="20" fill="#F59E0B" />
      
      {/* Top-left eye */}
      <rect x="18" y="20" width="18" height="18" rx="5" fill="#000" />
      
      {/* Top-right eye */}
      <rect x="64" y="20" width="18" height="18" rx="5" fill="#000" />
      
      {/* Middle mouth */}
      <rect x="20" y="46" width="60" height="16" rx="6" fill="#000" />
      
      {/* Bottom-left square */}
      <rect x="18" y="70" width="18" height="18" rx="5" fill="#000" />
      
      {/* Bottom-right square */}
      <rect x="64" y="70" width="18" height="18" rx="5" fill="#000" />
    </svg>
  );
}

