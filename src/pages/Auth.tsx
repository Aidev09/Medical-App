import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Phone, Lock, EyeOff, Eye, ArrowRight, UserPlus, LogIn, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import PageTransition from '@/components/ui/PageTransition';
import MedicoLogo from '@/components/ui/MedicoLogo';
import { useAppDispatch } from '@/store/hooks';
import { loginSuccess } from '@/store/slices/authSlice';
import { GoogleLogin } from '@react-oauth/google';
import { useMedications } from '../MedicationContext';

// Password strength utility
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score <= 2) return { label: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500' };
  return { label: 'Strong', color: 'bg-green-600' };
};

const Auth = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { clearMedications, fetchMedications } = useMedications();
  const [isLogin, setIsLogin] = useState(true);
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  // Signup fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Autofocus refs
  const firstNameRef = React.useRef<HTMLInputElement>(null);
  const loginEmailRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (isLogin) loginEmailRef.current?.focus();
    else firstNameRef.current?.focus();
  }, [isLogin]);

  // Password requirements
  const passwordRequirements = [
    { test: (pw: string) => pw.length >= 8, label: 'At least 8 characters' },
    { test: (pw: string) => /[A-Z]/.test(pw), label: 'One uppercase letter' },
    { test: (pw: string) => /[0-9]/.test(pw), label: 'One number' },
    { test: (pw: string) => /[^A-Za-z0-9]/.test(pw), label: 'One special character' },
  ];

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value.length <= 3) {
        value = `(${value}`;
      } else if (value.length <= 6) {
        value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
      } else if (value.length <= 10) {
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
      } else {
        // Handle longer numbers (international)
        value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}-${value.slice(10)}`;
      }
    }
    setSignupPhone(value);
  };

  // Validation
  const validateSignup = () => {
    const newErrors: { [key: string]: string } = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!signupEmail.trim()) newErrors.signupEmail = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(signupEmail)) newErrors.signupEmail = 'Invalid email address.';
    if (!signupPhone.trim()) newErrors.signupPhone = 'Phone number is required.';
    else if (signupPhone.replace(/\D/g, '').length < 10) newErrors.signupPhone = 'Phone number must be at least 10 digits.';
    if (!signupPassword) newErrors.signupPassword = 'Password is required.';
    else if (getPasswordStrength(signupPassword).label === 'Weak') newErrors.signupPassword = 'Password is too weak.';
    passwordRequirements.forEach(req => {
      if (!req.test(signupPassword)) newErrors.signupPassword = 'Password does not meet all requirements.';
    });
    if (!signupConfirmPassword) newErrors.signupConfirmPassword = 'Please confirm your password.';
    else if (signupPassword !== signupConfirmPassword) newErrors.signupConfirmPassword = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = () => {
    const newErrors: { [key: string]: string } = {};
    if (!loginEmail.trim()) newErrors.loginEmail = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(loginEmail)) newErrors.loginEmail = 'Invalid email address.';
    if (!loginPassword) newErrors.loginPassword = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await response.json();
      console.log('Login response:', data); // Debug log
      if (!response.ok) {
        // Check if it's a user not found error (email not registered)
        const errorMessage = data.detail || data.message || '';
        console.log('Error message:', errorMessage); // Debug log
        
        if (errorMessage.toLowerCase().includes('not found') || 
            errorMessage.toLowerCase().includes('invalid credentials') || 
            errorMessage.toLowerCase().includes('user not found') ||
            errorMessage.toLowerCase().includes('email not found') ||
            errorMessage.toLowerCase().includes('no user found') ||
            response.status === 404) {
          setErrors({ loginEmail: 'Your account is not registered. Create account first.' });
          return;
        } else {
          toast({ title: 'Error', description: errorMessage || 'Invalid credentials.' });
        }
        setLoading(false);
        return;
      }
      localStorage.setItem('userName', data.name || data.email?.split('@')[0]);
      localStorage.setItem('userId', data.id); // Save the user's unique id
      clearMedications(); // Clear old medications
      fetchMedications(); // Fetch new user's medications
      dispatch(loginSuccess(data));
      toast({ title: 'Welcome to Medico!', description: "You've successfully logged in." });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Error', description: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trim all fields
    setFirstName(firstName.trim());
    setLastName(lastName.trim());
    setSignupEmail(signupEmail.trim());
    setSignupPhone(signupPhone.trim());
    if (!validateSignup()) return;
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName.trim()} ${lastName.trim()}`,
          email: signupEmail.trim(),
          phone: signupPhone.replace(/\D/g, ''),
          password: signupPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: 'Error', description: data.detail || 'Registration failed.' });
        setLoading(false);
        return;
      }
      toast({ title: 'Account created!', description: 'Please log in to continue.' });
      setIsLogin(true);
      setLoading(false);
    } catch (err) {
      toast({ title: 'Error', description: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (credentialResponse: any) => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast({ title: 'Google Sign-In Error', description: data.detail || 'Something went wrong' });
        setLoading(false);
        return;
      }
      localStorage.setItem('userId', data.id); // Save the user's unique id
      clearMedications(); // Clear old medications
      fetchMedications(); // Fetch new user's medications
      dispatch(loginSuccess(data));
      toast({ title: 'Welcome to Medico!', description: "You've successfully signed in with Google." });
      navigate('/dashboard');
    } catch (err) {
      toast({ title: 'Error', description: 'Network error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo and App Name */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 flex justify-center"
        >
          <MedicoLogo size="md" animate={true} />
        </motion.div>
                  {/* Auth Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-card p-10 rounded-3xl shadow-2xl border border-border/50"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-foreground">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground text-base">
              {isLogin ? 'Sign in to continue to Medico' : 'Join Medico for better health management'}
            </p>
          </div>
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4" autoComplete="on">
                                              <div className="space-y-4">
                  <Label htmlFor="loginEmail" className="text-sm font-semibold text-foreground/90">Email Address</Label>
                  <div className="relative group">
                    <Input
                      id="loginEmail"
                      ref={loginEmailRef}
                      type="email"
                      placeholder="Enter your email address"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className={`pl-12 pr-4 py-4 border-2 transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary ${errors.loginEmail ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border hover:border-primary/50'}`}
                      required
                      aria-invalid={!!errors.loginEmail}
                      aria-describedby="loginEmail-error"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 h-5 w-5" />
                  </div>
                  <span id="loginEmail-error" className="text-sm text-red-500 flex items-center gap-1" aria-live="polite">
                    {errors.loginEmail && <span className="text-xs">⚠</span>}{errors.loginEmail}
                  </span>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="loginPassword" className="text-sm font-semibold text-foreground/90">Password</Label>
                  <div className="relative group">
                    <Input
                      id="loginPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className={`pl-12 pr-12 py-4 border-2 transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary ${errors.loginPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border hover:border-primary/50'}`}
                      required
                      aria-invalid={!!errors.loginPassword}
                      aria-describedby="loginPassword-error"
                    />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 h-5 w-5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-1 rounded-md hover:bg-muted/50"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <span id="loginPassword-error" className="text-sm text-red-500 flex items-center gap-1" aria-live="polite">
                    {errors.loginPassword && <span className="text-xs">⚠</span>}{errors.loginPassword}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div></div>
                  <button 
                    type="button" 
                    className="text-sm text-primary hover:text-primary/80 font-medium transition-colors duration-200 hover:underline" 
                    tabIndex={0} 
                    onClick={() => toast({title:'Forgot Password?', description:'Password reset coming soon.'})}
                  >
                    Forgot password?
                  </button>
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-4 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-md mt-8 group" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center group-hover:translate-x-1 transition-transform duration-200">
                      <LogIn className="mr-2 h-5 w-5" />Sign In
                    </span>
                  )}
                </Button>
            </form>
          ) : (
              <form onSubmit={handleSignup} className="space-y-6" autoComplete="on">
              <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-foreground/90">First Name</Label>
                    <div className="relative group">
                      <Input
                        id="firstName"
                        ref={firstNameRef}
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={e => setFirstName(e.target.value)}
                        className={`pl-12 pr-4 py-4 border-2 transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border hover:border-primary/50'}`}
                        required
                        aria-invalid={!!errors.firstName}
                        aria-describedby="firstName-error"
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 h-5 w-5" />
                    </div>
                    <span id="firstName-error" className="text-sm text-red-500 flex items-center gap-1" aria-live="polite">
                      {errors.firstName && <span className="text-xs">⚠</span>}{errors.firstName}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-foreground/90">Last Name</Label>
                    <div className="relative group">
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={e => setLastName(e.target.value)}
                        className={`pl-12 pr-4 py-4 border-2 transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:border-primary ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-border hover:border-primary/50'}`}
                        required
                        aria-invalid={!!errors.lastName}
                        aria-describedby="lastName-error"
                      />
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-300 h-5 w-5" />
                    </div>
                    <span id="lastName-error" className="text-sm text-red-500 flex items-center gap-1" aria-live="polite">
                      {errors.lastName && <span className="text-xs">⚠</span>}{errors.lastName}
                    </span>
                  </div>
                </div>
                              <div className="space-y-3">
                  <Label htmlFor="signupEmail" className="text-sm font-medium">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="signupEmail"
                      type="email"
                      placeholder="Enter your email address"
                      value={signupEmail}
                      onChange={e => setSignupEmail(e.target.value)}
                      className={`pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/50 ${errors.signupEmail ? 'border-red-500' : ''}`}
                      required
                      aria-invalid={!!errors.signupEmail}
                      aria-describedby="signupEmail-error"
                    />
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  </div>
                  <span id="signupEmail-error" className="text-sm text-red-500" aria-live="polite">{errors.signupEmail}</span>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="signupPhone" className="text-sm font-medium">Phone Number</Label>
                  <div className="relative">
                    <Input
                      id="signupPhone"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={signupPhone}
                      onChange={handlePhoneChange}
                      className={`pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/50 ${errors.signupPhone ? 'border-red-500' : ''}`}
                      required
                      maxLength={20}
                      aria-invalid={!!errors.signupPhone}
                      aria-describedby="signupPhone-error"
                    />
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  </div>
                  <span id="signupPhone-error" className="text-sm text-red-500" aria-live="polite">{errors.signupPhone}</span>
                </div>
                              <div className="space-y-3">
                  <Label htmlFor="signupPassword" className="text-sm font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="signupPassword"
                    type={showSignupPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                      className={`pl-12 pr-12 py-3 focus:ring-2 focus:ring-primary/50 ${errors.signupPassword ? 'border-red-500' : ''}`}
                    required
                    aria-invalid={!!errors.signupPassword}
                    aria-describedby="signupPassword-error"
                  />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showSignupPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {/* Password requirements */}
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Password requirements:</p>
                    <ul className="text-xs space-y-1">
                  {passwordRequirements.map((req, idx) => (
                        <li key={idx} className={req.test(signupPassword) ? 'text-green-600 flex items-center' : 'text-muted-foreground flex items-center'}>
                          {req.test(signupPassword) ? (
                            <span className="mr-2 text-green-500">✓</span>
                          ) : (
                            <span className="mr-2 text-gray-400">○</span>
                          )}
                          {req.label}
                    </li>
                  ))}
                </ul>
                {/* Password strength meter */}
                {signupPassword && (
                      <div className="flex items-center mt-2">
                    <div className={`h-2 w-20 rounded-full ${getPasswordStrength(signupPassword).color} mr-2 transition-all duration-300`}></div>
                        <span className={`text-xs font-medium ${getPasswordStrength(signupPassword).color.replace('bg-', 'text-')}`}>
                          {getPasswordStrength(signupPassword).label}
                        </span>
                      </div>
                    )}
                  </div>
                  <span id="signupPassword-error" className="text-sm text-red-500" aria-live="polite">{errors.signupPassword}</span>
              </div>
                              <div className="space-y-3">
                  <Label htmlFor="signupConfirmPassword" className="text-sm font-medium">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="signupConfirmPassword"
                    type={showSignupConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                    value={signupConfirmPassword}
                    onChange={e => setSignupConfirmPassword(e.target.value)}
                      className={`pl-12 pr-12 py-3 focus:ring-2 focus:ring-primary/50 ${errors.signupConfirmPassword ? 'border-red-500' : ''}`}
                    required
                    aria-invalid={!!errors.signupConfirmPassword}
                    aria-describedby="signupConfirmPassword-error"
                    onPaste={e => e.preventDefault()}
                  />
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <button
                    type="button"
                    onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showSignupConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                  {/* Checkmark if passwords match and not empty */}
                  {signupConfirmPassword && signupPassword === signupConfirmPassword && (
                      <span className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-600" aria-label="Passwords match">✓</span>
                  )}
                  </div>
                  <span id="signupConfirmPassword-error" className="text-sm text-red-500" aria-live="polite">{errors.signupConfirmPassword}</span>
                </div>
                <Button 
                  type="submit" 
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-lg mt-6" 
                  disabled={loading || !firstName.trim() || !lastName.trim() || !signupEmail.trim() || !signupPhone.trim() || !signupPassword || !signupConfirmPassword || Object.keys(errors).length > 0 || passwordRequirements.some(req => !req.test(signupPassword)) || signupPassword !== signupConfirmPassword}
                >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                    Creating account...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="mr-2 h-5 w-5" />Create Account
                  </span>
                )}
              </Button>
              <div className="text-xs text-muted-foreground mt-2 text-center">We’ll never share your email or phone.</div>
              <div className="text-xs text-muted-foreground mt-1 text-center">By signing up, you agree to our <a href="#" className="underline text-primary">Terms</a> and <a href="#" className="underline text-primary">Privacy Policy</a>.</div>
            </form>
          )}
          {/* Google Login Button */}
            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="mt-6">
                <GoogleLogin
                  onSuccess={handleGoogleAuth}
                  onError={() => toast({ title: 'Google Sign-In Error', description: 'Try again.' })}
                  width="100%"
                  useOneTap
                />
              </div>
            </div>
          </motion.div>
          {/* Toggle between login and signup */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-center mt-10"
          >
            <p className="text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setLoading(false);
                }}
                className="text-primary font-semibold ml-2 hover:text-primary/80 transition-colors duration-200 hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
      </div>
    </PageTransition>
  );
};

export default Auth;
