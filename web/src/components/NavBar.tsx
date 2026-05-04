import { NavLink } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

const links = [
  { to: '/', label: '概览' },
  { to: '/fire', label: 'FIRE' },
  { to: '/allocation', label: '配置' },
];

export default function NavBar() {
  const [dark, setDark] = useState(() => {
    if (localStorage.getItem('free-theme') === 'dark') return true;
    if (localStorage.getItem('free-theme') === 'light') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('free-theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 border-b border-sand/60 bg-parchment/90 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between h-12 px-6">
        <div className="flex items-center gap-6">
          <span className="text-base font-serif font-medium tracking-wide text-brand select-none">
            free
          </span>
          <nav className="flex items-center gap-0.5">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'relative px-3 py-1 text-[13px] rounded-md transition-colors',
                    isActive
                      ? 'text-deep font-medium'
                      : 'text-stone hover:text-olive'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-[2px] rounded-full bg-brand" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="p-1.5 rounded-md text-stone/60 hover:text-stone transition-colors"
          aria-label="切换主题"
        >
          {dark ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
        </button>
      </div>
    </header>
  );
}
