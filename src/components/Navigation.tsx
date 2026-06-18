import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FileSpreadsheet, Trophy, Users, Award, Tag, Home, BarChart3, Menu, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/context/LanguageContext';

const navKeys = [
  { path: '/',            icon: Home,          key: 'home' },
  { path: '/assessments', icon: FileSpreadsheet, key: 'assessments' },
  { path: '/rank',        icon: Trophy,        key: 'rank' },
  { path: '/roster',      icon: Users,         key: 'roster' },
  { path: '/analysis',    icon: BarChart3,     key: 'analysis' },
  { path: '/certificate', icon: Award,         key: 'certificate' },
  { path: '/pricing',     icon: Tag,           key: 'pricing' },
];

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navItems = navKeys.map(({ path, icon, key }) => ({
    path,
    icon,
    label: t(`nav.${key}`),
  }));

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
