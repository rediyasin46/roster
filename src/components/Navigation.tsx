import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FileSpreadsheet, Trophy, Users, Award, Tag, Home, BarChart3, Menu, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/assessments', icon: FileSpreadsheet, label: 'Assessments' },
  { path: '/rank', icon: Trophy, label: 'Rank' },
  { path: '/roster', icon: Users, label: 'Roster' },
  { path: '/analysis', icon: BarChart3, label: 'Analysis' },
  { path: '/certificate', icon: Award, label: 'Certificate' },
  { path: '/pricing', icon: Tag, label: 'Pricing' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  if (isMobile) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-12 w-48 bg-card rounded-lg shadow-lg border p-2 z-50">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => handleNavigate(path)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'bg-muted text-muted-foreground hover:bg-primary/20'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

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
                } px-3 py-2`}
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
                <span className="text-sm font-medium hidden md:inline">{label}</span>
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
