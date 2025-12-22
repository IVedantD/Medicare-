import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import { getDashboardPath } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/Loader';
import { Heart, Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, Stethoscope, MapPin, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  validateEmail, 
  validatePassword, 
  validateName, 
  validatePasswordConfirm,
  validateIndiaPhone,
  validateIndiaPincode,
  formatIndiaPhone,
  getPasswordStrength
} from '@/utils/validation';
import { INDIAN_STATES } from '@/utils/localization';

const roles: { value: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
  { value: 'patient', label: 'Patient', icon: User, desc: 'Book appointments & access records' },
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patients & appointments' },
];

const specializations = [
  'General Medicine',
  'Cardiology',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
  'Neurology',
  'Gynecology',
  'Ophthalmology',
  'ENT',
  'Psychiatry',
];

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [specialization, setSpecialization] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // India-specific address fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  
  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  // Password strength indicator
  const passwordStrength = getPasswordStrength(password);

  // Real-time validation
  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.name) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) newErrors.name = nameValidation.message;
    }
    
    if (touched.email) {
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) newErrors.email = emailValidation.message;
    }
    
    if (touched.phone && phone) {
      const phoneValidation = validateIndiaPhone(phone);
      if (!phoneValidation.isValid) newErrors.phone = phoneValidation.message;
    }
    
    if (touched.password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) newErrors.password = passwordValidation.message;
    }
    
    if (touched.confirmPassword) {
      const confirmValidation = validatePasswordConfirm(password, confirmPassword);
      if (!confirmValidation.isValid) newErrors.confirmPassword = confirmValidation.message;
    }
    
    if (touched.pincode && pincode) {
      const pincodeValidation = validateIndiaPincode(pincode);
      if (!pincodeValidation.isValid) newErrors.pincode = pincodeValidation.message;
    }
    
    setErrors(newErrors);
  }, [name, email, phone, password, confirmPassword, pincode, touched]);

  // Handle phone input formatting
  const handlePhoneChange = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');
    // Auto-format to Indian format
    if (cleaned.startsWith('+91') || cleaned.startsWith('91') || /^\d{10}$/.test(cleaned.replace(/\+91/g, '').replace(/91/g, ''))) {
      const formatted = formatIndiaPhone(cleaned);
      setPhone(formatted);
    } else {
      setPhone(cleaned);
    }
    setTouched({ ...touched, phone: true });
  };

  // Check if form is valid
  const isFormValid = () => {
    const nameValid = validateName(name).isValid;
    const emailValid = validateEmail(email).isValid;
    const passwordValid = validatePassword(password).isValid;
    const confirmValid = validatePasswordConfirm(password, confirmPassword).isValid;
    const phoneValid = !phone || validateIndiaPhone(phone).isValid;
    const pincodeValid = !pincode || validateIndiaPincode(pincode).isValid;
    const specializationValid = role !== 'doctor' || specialization;
    
    return nameValid && emailValid && passwordValid && confirmValid && phoneValid && pincodeValid && specializationValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      pincode: true,
    });
    
    if (!isFormValid()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        role,
        phone: phone || undefined,
        specialization: role === 'doctor' ? specialization : undefined,
        address: (street || city || state || pincode) ? {
          street: street || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
        } : undefined,
      });
      toast.success('Account created successfully!');
      
      // Use a small delay to ensure React state updates before navigation
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const dashboardPath = getDashboardPath(role);
      console.log('[REGISTER] Navigating to dashboard:', dashboardPath, 'for role:', role);
      navigate(dashboardPath, { replace: true });
    } catch (error: any) {
      console.error('[REGISTER] Registration error:', error);
      const errorMessage = error.message || 'Registration failed';
      console.error('[REGISTER] Error message:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 relative bg-gradient-hero items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoLTR2LTJoNHYtNGgydjRoNHYyaC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative text-center text-primary-foreground max-w-md">
          <Heart className="h-16 w-16 mx-auto mb-6 animate-pulse-soft" />
          <h2 className="text-3xl font-display font-bold mb-4">
            Join Our Healthcare Community
          </h2>
          <p className="text-primary-foreground/80">
            Whether you're a patient seeking quality care or a doctor looking to 
            expand your practice, MediCare is here for you.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12">
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
            Create your account
          </h1>
          <p className="text-muted-foreground mb-8">
            Join MediCare to access quality healthcare services
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                      role === r.value
                        ? "border-primary bg-primary/5"
                        : "border-input hover:border-primary/30"
                    )}
                  >
                    <r.icon className={cn(
                      "h-6 w-6",
                      role === r.value ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "font-medium",
                      role === r.value ? "text-primary" : "text-foreground"
                    )}>
                      {r.label}
                    </span>
                    <span className="text-xs text-muted-foreground text-center">
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setTouched({ ...touched, name: true });
                  }}
                  onBlur={() => setTouched({ ...touched, name: true })}
                  className={cn(
                    "w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.name ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                  )}
                  placeholder={role === 'doctor' ? 'Dr. John Smith' : 'John Doe'}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Specialization for Doctors */}
            {role === 'doctor' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Specialization *
                </label>
                <select
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
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

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={() => setTouched({ ...touched, phone: true })}
                  className={cn(
                    "w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.phone ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                  )}
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>
              {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password *
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
                  placeholder="Create a password"
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
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    {passwordStrength.requirements.map((req, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-1 flex-1 rounded",
                          req.met ? "bg-green-500" : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className={cn(
                      "font-medium",
                      passwordStrength.strength === 'strong' && "text-green-600",
                      passwordStrength.strength === 'medium' && "text-yellow-600",
                      passwordStrength.strength === 'weak' && "text-red-600"
                    )}>
                      {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)} password
                    </span>
                    <ul className="mt-1 space-y-0.5">
                      {passwordStrength.requirements.map((req, idx) => (
                        <li key={idx} className={cn(
                          "flex items-center gap-1",
                          req.met ? "text-green-600" : "text-muted-foreground"
                        )}>
                          <span>{req.met ? '✓' : '○'}</span>
                          <span>{req.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setTouched({ ...touched, confirmPassword: true });
                  }}
                  onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                  className={cn(
                    "w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.confirmPassword ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                  )}
                  placeholder="Confirm your password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>}
            </div>
            
            {/* India Address Fields */}
            <div className="space-y-4 pt-2 border-t">
              <h3 className="text-sm font-medium text-foreground">Address (Optional)</h3>
              
              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="House/Flat No., Street"
                  />
                </div>
              </div>
              
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  City
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="City"
                  />
                </div>
              </div>
              
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  State
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((stateName) => (
                    <option key={stateName} value={stateName}>{stateName}</option>
                  ))}
                </select>
              </div>
              
              {/* Pincode */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Pincode
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setPincode(value);
                      setTouched({ ...touched, pincode: true });
                    }}
                    onBlur={() => setTouched({ ...touched, pincode: true })}
                    className={cn(
                      "w-full h-12 pl-11 pr-4 rounded-xl border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                      errors.pincode ? "border-destructive focus:ring-destructive" : "border-input focus:ring-ring"
                    )}
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                </div>
                {errors.pincode && <p className="mt-1 text-sm text-destructive">{errors.pincode}</p>}
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 rounded border-input" required />
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full"
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? <Loader size="sm" /> : 'Create Account'}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
