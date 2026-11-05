import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';

// Screens with a full-bleed photo at the top get light status bar glyphs.
const LIGHT_TOP = [/^\/$/, /^\/style\//, /^\/setup\/generating/];

export function Device({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const lightTop = LIGHT_TOP.some((r) => r.test(pathname));

  return (
    <div className="stage">
      <div className="device">
        <div className={`statusbar${lightTop ? ' light' : ''}`} aria-hidden="true">
          <span>9:41</span>
          <span style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
              <rect x="0" y="8" width="3.2" height="4" rx="1" />
              <rect x="5" y="5.5" width="3.2" height="6.5" rx="1" />
              <rect x="10" y="3" width="3.2" height="9" rx="1" />
              <rect x="15" y="0" width="3.2" height="12" rx="1" />
            </svg>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
              <path d="M8.5 2.3c2.4 0 4.6.9 6.2 2.5l1.2-1.2A10.4 10.4 0 0 0 8.5.6 10.4 10.4 0 0 0 1.1 3.6l1.2 1.2A8.7 8.7 0 0 1 8.5 2.3Z" />
              <path d="M8.5 5.7c1.5 0 2.8.6 3.8 1.5l1.2-1.2a7 7 0 0 0-10 0l1.2 1.2c1-.9 2.3-1.5 3.8-1.5Z" />
              <path d="M8.5 9c.6 0 1.1.2 1.5.6L8.5 11.2 7 9.6c.4-.4.9-.6 1.5-.6Z" />
            </svg>
            <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
              <rect x=".5" y=".5" width="23" height="12" rx="3.8" stroke="currentColor" opacity=".4" />
              <rect x="2" y="2" width="20" height="9" rx="2.5" fill="currentColor" />
              <path d="M25 4.5v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2Z" fill="currentColor" opacity=".5" />
            </svg>
          </span>
        </div>
        {children}
        <div className="home-indicator" aria-hidden="true" />
      </div>
    </div>
  );
}
