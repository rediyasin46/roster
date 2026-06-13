import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Navigation } from '@/components/Navigation';
import { Settings } from '@/components/Settings';
import { Auth, type AuthUser } from '@/components/Auth';
import { UserProfileMenu } from '@/components/UserProfileMenu';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';

export function AppHeader() {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [user, setUser] = useState<AuthUser | null>(null);

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
        {isMobile ? (
          // Small screen: RB in circle
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
              RB
            </div>
            <span className="text-xs font-medium mt-1">RosterBook</span>
          </div>
        ) : (
          // Large/Medium screen: Full text
          <h1 className="text-2xl font-bold">RosterBook</h1>
        )}
      </div>

      {/* Navigation and Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Navigation */}
        <Navigation />

        {/* Settings Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="rounded-lg"
          title="Settings"
        >
          <SettingsIcon className="w-5 h-5" />
        </Button>

        {/* Get Started / User Profile */}
        {user ? (
          <UserProfileMenu user={user} onLogout={handleLogout} />
        ) : (
          <Button
            size="sm"
            onClick={() => setAuthOpen(true)}
            className="rounded-lg"
          >
            Get Started
          </Button>
        )}
      </div>

      {/* Settings Dialog */}
      <Settings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        language={language}
        onLanguageChange={setLanguage}
        theme={theme}
        onThemeChange={setTheme}
      />

      {/* Auth Dialog */}
      <Auth
        open={authOpen}
        onOpenChange={setAuthOpen}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
