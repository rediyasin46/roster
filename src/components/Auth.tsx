import { useState } from 'react';
import { Mail, Eye, EyeOff, Phone, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface AuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'signin' | 'signup';
}

export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  nationalId?: string;
  userType?: 'school' | 'individual';
  schoolName?: string;
}

export function Auth({ open, onOpenChange, onAuthSuccess, initialMode = 'signin' }: AuthProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Sign In Form
  const [signInForm, setSignInForm] = useState({
    username: '',
    password: '',
    userType: 'school' as 'school' | 'individual',
  });

  // Sign Up Form
  const [signUpForm, setSignUpForm] = useState({
    fullName: '',
    username: '',
    phoneOrNationalId: '',
    password: '',
    confirmPassword: '',
    userType: 'school' as 'school' | 'individual',
    schoolName: '',
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (!signInForm.username || !signInForm.password) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      const user: AuthUser = {
        id: `user-${Date.now()}`,
        fullName: signInForm.username,
        username: signInForm.username,
        userType: signInForm.userType,
      };

      toast({
        title: 'Success',
        description: `Welcome back, ${signInForm.username}!`,
      });

      onAuthSuccess(user);
      onOpenChange(false);
      setSignInForm({ username: '', password: '', userType: 'school' });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Sign in failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      if (
        !signUpForm.fullName ||
        !signUpForm.username ||
        !signUpForm.phoneOrNationalId ||
        !signUpForm.password
      ) {
        toast({
          title: 'Error',
          description: 'Please fill in all fields',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (signUpForm.userType === 'school' && !signUpForm.schoolName) {
        toast({
          title: 'Error',
          description: 'Please enter your school name',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (signUpForm.password !== signUpForm.confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      if (signUpForm.password.length < 6) {
        toast({
          title: 'Error',
          description: 'Password must be at least 6 characters',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user: AuthUser = {
        id: `user-${Date.now()}`,
        fullName: signUpForm.fullName,
        username: signUpForm.username,
        phone: signUpForm.phoneOrNationalId.length === 10 ? signUpForm.phoneOrNationalId : undefined,
        nationalId: signUpForm.phoneOrNationalId.length > 10 ? signUpForm.phoneOrNationalId : undefined,
        userType: signUpForm.userType,
        schoolName: signUpForm.userType === 'school' ? signUpForm.schoolName : undefined,
      };

      toast({
        title: 'Success',
        description: `Welcome, ${signUpForm.fullName}! Your account has been created.`,
      });

      onAuthSuccess(user);
      onOpenChange(false);
      setSignUpForm({
        fullName: '',
        username: '',
        phoneOrNationalId: '',
        password: '',
        confirmPassword: '',
        userType: 'school',
        schoolName: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Sign up failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {authMode === 'signin' ? 'Sign In' : 'Create Account'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {authMode === 'signin' ? (
            // Sign In Form
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  User Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSignInForm({ ...signInForm, userType: 'school' })}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      signInForm.userType === 'school'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    School User
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignInForm({ ...signInForm, userType: 'individual' })}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      signInForm.userType === 'individual'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Individual User
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  placeholder="Enter your username"
                  value={signInForm.username}
                  onChange={(e) =>
                    setSignInForm({ ...signInForm, username: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={(e) =>
                      setSignInForm({
                        ...signInForm,
                        password: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="text-sm text-primary hover:underline"
                  onClick={() => {
                    toast({
                      title: 'Password Reset',
                      description: 'Password reset email sent to your email address',
                    });
                  }}
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          ) : (
            // Sign Up Form
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  User Type
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSignUpForm({ ...signUpForm, userType: 'school' })}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      signUpForm.userType === 'school'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    School User
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignUpForm({ ...signUpForm, userType: 'individual' })}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      signUpForm.userType === 'individual'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Individual User
                  </button>
                </div>
              </div>

              {signUpForm.userType === 'school' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    School Name
                  </label>
                  <Input
                    placeholder="Enter your school name"
                    value={signUpForm.schoolName}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, schoolName: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name
                </label>
                <Input
                  placeholder="Enter your full name"
                  value={signUpForm.fullName}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, fullName: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Username
                </label>
                <Input
                  placeholder="Choose a username"
                  value={signUpForm.username}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, username: e.target.value })
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number or National ID
                </label>
                <Input
                  placeholder="Phone or National ID (e.g., +251912345678 or 0001-12345-67890)"
                  value={signUpForm.phoneOrNationalId}
                  onChange={(e) =>
                    setSignUpForm({
                      ...signUpForm,
                      phoneOrNationalId: e.target.value,
                    })
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password (min. 6 characters)"
                    value={signUpForm.password}
                    onChange={(e) =>
                      setSignUpForm({ ...signUpForm, password: e.target.value })
                    }
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={signUpForm.confirmPassword}
                    onChange={(e) =>
                      setSignUpForm({
                        ...signUpForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating Account...' : 'Sign Up'}
              </Button>
            </form>
          )}

          {/* Toggle between Sign In and Sign Up */}
          <div className="text-center text-sm">
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('signin')}
                  className="text-primary hover:underline font-medium"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
