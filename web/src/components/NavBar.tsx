import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Target, PieChart, Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

const links = [
  { to: '/', icon: LayoutDashboard, label: '资产总览' },
  { to: '/fire', icon: Target, label: 'FIRE 追踪' },
  { to: '/allocation', icon: PieChart, label: '配置分析' },
];

export default function NavBar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <nav className="h-14 border-b flex items-center justify-between px-6 bg-card">
      <div className="flex items-center gap-1">
        <span className="text-xl font-bold text-primary mr-6">free</span>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={() => setDark(!dark)}
        className="p-2 rounded-md hover:bg-secondary text-muted-foreground"
      >
        {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </nav>
  );
}
