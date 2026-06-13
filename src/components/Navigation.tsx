import { useLocation, useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Trophy, Users, Award, Tag, Home } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { path: '/home', icon: Home, label: 'Home' },
  { path: '/', icon: FileSpreadsheet, label: 'Assessments' },
  { path: '/rank', icon: Trophy, label: 'Rank' },
  { path: '/roster', icon: Users, label: 'Roster' },
  { path: '/certificate', icon: Award, label: 'Certificate' },
  { path: '/pricing', icon: Tag, label: 'Pricing' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <nav className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 bg-card rounded-lg shadow-sm border overflow-x-auto">
      {navItems.map(({ path, icon: Icon, label }) => {
        const isActive = location.pathname === path;
        return (
          <Tooltip key={path}>
            <TooltipTrigger asChild>
              <button
                onClick={() => navigate(path)}
                className={`flex items-center gap-1 sm:gap-1.5 rounded-lg transition-all hover:scale-105 whitespace-nowrap ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-primary/20'
                } ${isMobile ? 'px-2 py-2' : 'px-3 py-2'}`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                {!isMobile && (
                  <span className="text-sm font-medium hidden md:inline">{label}</span>
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
