import { getDashboardPath } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/Loader';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Eye, EyeOff, Heart, Lock, Mail } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { validateEmail, validatePassword } from '@/utils/validation';
import { cn } from '@/lib/utils';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) newErrors.email = emailValidation.message;
    }
    
    if (touched.password) {
      if (!password) {
        newErrors.password = 'Password is required';
      }
    }
    
    setErrors(newErrors);
  }, [email, password, touched]);

  const isFormValid = () => {
    const emailValid = validateEmail(email).isValid;
    const passwordValid = !!password;
    return emailValid && passwordValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ email: true, password: true });
    
    if (!isFormValid()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[LOGIN PAGE] Attempting login for:', email);
      await login(email, password);
      console.log('[LOGIN PAGE] Login function completed successfully');
      
      toast.success('Welcome back!');
      
      // Use a longer delay to ensure React state updates and API response is processed
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const storedUser = localStorage.getItem('clinic_user');
      const storedToken = localStorage.getItem('clinic_token');
      
      console.log('[LOGIN PAGE] Checking localStorage...');
      console.log('[LOGIN PAGE] Token exists:', !!storedToken);
      console.log('[LOGIN PAGE] User exists:', !!storedUser);
      
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          console.log('[LOGIN PAGE] Parsed user:', { email: user.email, role: user.role, id: user.id });
          
          if (user && user.role) {
            const dashboardPath = getDashboardPath(user.role);
            console.log('[LOGIN PAGE] Navigating to dashboard:', dashboardPath, 'for role:', user.role);
            
            // Use window.location for more reliable navigation
            window.location.href = dashboardPath;
          } else {
            console.error('[LOGIN PAGE] Invalid user data in localStorage:', user);
            toast.error('Invalid user data. Please try again.');
          }
        } catch (parseError) {
          console.error('[LOGIN PAGE] Error parsing user data:', parseError);
          toast.error('Error processing user data. Please try again.');
        }
      } else {
        console.error('[LOGIN PAGE] No user data in localStorage after login');
        console.error('[LOGIN PAGE] This means login did not complete successfully');
        toast.error('Login failed. Please check your credentials.');
      }
    } catch (error: any) {
      console.error('[LOGIN PAGE] Login error:', error);
      console.error('[LOGIN PAGE] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Patient', email: 'patient@demo.com', password: 'password123' },
    { role: 'Doctor', email: 'doctor@demo.com', password: 'password123' },
    { role: 'Admin', email: 'admin@demo.com', password: 'password123' },
  ];

  const fillDemo = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-hero">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold text-foreground">MediCare</span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-muted-foreground mb-8">
            Enter your credentials to access your account
          </p>

          {/* Demo Credentials */}
          <div className="mb-6 p-4 rounded-xl bg-muted/50 border">
            <p className="text-sm font-medium text-foreground mb-3">Demo Accounts:</p>
            <div className="flex flex-wrap gap-2">
              {demoCredentials.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => fillDemo(demo.email, demo.password)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {demo.role}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setTouched({ ...touched, email: true });
                  }}
                  onBlur={() => setTouched({ ...touched, email: true })}
                  className={cn(
                    "w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.email ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                  )}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setTouched({ ...touched, password: true });
                  }}
                  onBlur={() => setTouched({ ...touched, password: true })}
                  className={cn(
                    "w-full h-12 pl-11 pr-12 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.password ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                  )}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-destructive">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-input" />
                <span className="text-sm text-muted-foreground">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? <Loader size="sm" /> : 'Sign In'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-hero items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoLTR2LTJoNHYtNGgydjRoNHYyaC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative text-center text-primary-foreground max-w-md">
          <Heart className="h-16 w-16 mx-auto mb-6 animate-pulse-soft" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Quality Healthcare at Your Fingertips
          </h2>
          <p className="text-primary-foreground/80">
            Access your medical records, book appointments, and connect with 
            top healthcare professionals all in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
