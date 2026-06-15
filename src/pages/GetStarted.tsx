import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppHeader } from '@/components/AppHeader';
import { Auth, AuthUser } from '@/components/Auth';

export default function GetStarted() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authOpen, setAuthOpen] = useState(true);

  useEffect(() => {
    // Get mode from URL params (signup or signin)
    const mode = searchParams.get('mode') as 'signup' | 'signin' | null;
    if (mode === 'signup' || mode === 'signin') {
      setAuthMode(mode);
    }
  }, [searchParams]);

  const handleAuthSuccess = (user: AuthUser) => {
    // Redirect to dashboard or home page after successful auth
    navigate('/');
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // If user closes the dialog, go back to home
      navigate('/');
    }
    setAuthOpen(open);
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
        <div className="text-center space-y-6 max-w-md">
          <h1 className="text-4xl font-bold">
            {authMode === 'signup' ? 'Create Account' : 'Sign In'}
          </h1>
          <p className="text-muted-foreground text-lg">
            {authMode === 'signup'
              ? 'Join Rosterbook today and start managing marks with ease.'
              : 'Welcome back! Sign in to your account.'}
          </p>
        </div>
      </div>

      <Auth
        open={authOpen}
        onOpenChange={handleOpenChange}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
}
