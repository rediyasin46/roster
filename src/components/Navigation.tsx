import { useLocation, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Trophy, Users } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const navItems = [
  { path: '/', icon: FileSpreadsheet, label: 'Continues Assessments' },
  { path: '/rank', icon: Trophy, label: 'Student Rank' },
  { path: '/roster', icon: Users, label: 'Student Roster' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center gap-2 p-2 bg-card rounded-lg shadow-sm border">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <Tooltip key={path}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate(path)}
                className={`nav-icon ${isActive ? 'nav-icon-active' : 'nav-icon-inactive'}`}
              >
                <Icon className="w-6 h-6" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
