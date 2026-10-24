import { Link } from 'react-router-dom';

export const LogoMark = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
    <defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#7C5CFC" /><stop offset="1" stopColor="#2BE0F7" /></linearGradient></defs>
    <rect width="32" height="32" rx="9" fill="url(#lg)" />
    <path d="M9 22V10l14 12V10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Logo = ({ to = '/' }) => (
  <Link to={to} className="inline-flex items-center gap-2.5 font-display text-[17px] font-semibold tracking-tight">
    <LogoMark /> Note2Quiz
  </Link>
);
