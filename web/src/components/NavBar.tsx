import { NavLink } from 'react-router-dom';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

const links = [
  { to: '/', label: '概览' },
  { to: '/fire', label: 'FIRE' },
  { to: '/allocation', label: '配置' },
];

export default function NavBar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/50 glass">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-6">
        <div className="flex items-center gap-8">
          <span className="font-serif text-xl italic font-medium tracking-tight text-accent select-none">
            free
          </span>
          <nav className="flex items-center gap-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-accent'
                      : 'text-fg-dim hover:text-fg'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-accent" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          onClick={() => setDark(!dark)}
          className="p-2 rounded-lg text-fg-dim hover:text-fg hover:bg-surface-alt transition-colors"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
