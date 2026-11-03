import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function Icon({ name, fill, className = '' }: { name: string; fill?: boolean; className?: string }) {
  return (
    <span className={`icon${fill ? ' fill' : ''} ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

export function BackButton({ to, icon = 'chevron_left', label = 'Back', onImage }: {
  to?: string;
  icon?: string;
  label?: string;
  onImage?: boolean;
}) {
  const navigate = useNavigate();
  return (
    <button
      className={`icon-btn${onImage ? ' on-image' : ''}`}
      aria-label={label}
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      <Icon name={icon} />
    </button>
  );
}

export function Screen({ children, plain, className = '' }: { children: ReactNode; plain?: boolean; className?: string }) {
  return <main className={`screen${plain ? ' plain' : ''} ${className}`}>{children}</main>;
}

export function AppleMark() {
  return (
    <svg width="15" height="18" viewBox="0 0 814 1000" fill="currentColor" aria-hidden="true">
      <path d="M788 341c-6 4-108 62-108 190 0 148 130 200 134 202-1 3-21 72-69 142-43 62-88 124-156 124s-86-40-165-40c-77 0-104 41-166 41s-106-58-156-128C44 790 0 671 0 557c0-182 118-279 235-279 62 0 114 41 153 41 37 0 95-43 166-43 27 0 124 2 188 65zM554 160c29-35 50-83 50-131 0-7-1-14-2-19-48 2-104 32-138 71-27 30-52 78-52 127 0 7 1 15 2 17 3 1 8 1 13 1 43 0 97-29 127-66z" />
    </svg>
  );
}

export function useToast(): [string | null, (msg: string) => void] {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 2200);
    return () => clearTimeout(t);
  }, [msg]);
  return [msg, setMsg];
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="toast" role="status">
      {message}
    </div>
  );
}
