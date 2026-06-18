import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigation } from '@/components/Navigation';
import { Settings } from '@/components/Settings';
import { Auth, type AuthUser } from '@/components/Auth';
import { UserProfileMenu } from '@/components/UserProfileMenu';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, GraduationCap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function AppHeader() {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('rosterbook-theme') as 'light' | 'dark') || 'light';
    }
    return 'light';
  });
  const [user, setUser] = useState<AuthUser | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('rosterbook-theme', theme);
  }, [theme]);

  const handleAuthSuccess = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="markbook-header flex items-center justify-between">
      {/* App Logo/Name */}
      <div className="flex items-center gap-2">
        <GraduationCap className="w-7 h-7 text-accent shrink-0" />
        <h1 className={`font-bold ${isMobile ? 'text-sm' : 'text-2xl'}`}>{t('brand.name')}</h1>
      </div>

      {/* Navigation and Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Navigation />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg"
          title={t('settings.title')}
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>

        {user ? (
          <UserProfileMenu user={user} onLogout={handleLogout} />
        ) : (
          <Button
            size="sm"
            onClick={() => setAuthOpen(true)}
            className="rounded-lg"
          >
            {t('actions.getStarted')}
          </Button>
        )}
      </div>

      <Settings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        theme={theme}
        onThemeChange={setTheme}
      />

      <Auth
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
