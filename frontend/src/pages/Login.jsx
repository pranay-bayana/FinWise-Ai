import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Wallet, Mail, Lock, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { AuthSideIllustration } from '../assets/images/auth/AuthSideIllustration.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login, startGoogleOAuth, biometricLogin } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try { 
      await login(formData); 
      toast.success('Login successful!'); 
      navigate('/dashboard'); 
    }
    catch (error) { 
      toast.error(error.response?.data?.message || 'Login failed'); 
    }
    finally { 
      setLoading(false); 
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await startGoogleOAuth();
    } catch (error) {
      toast.error(error.message || 'Google login failed');
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!window.PublicKeyCredential) { toast.error('Passkey not supported'); return; }
    if (!formData.email) { toast.error('Enter your email first'); return; }
    try { setLoading(true); await biometricLogin(formData.email); toast.success('Welcome back!'); navigate('/dashboard'); }
    catch (error) { toast.error(error.response?.data?.message || 'Passkey login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#080b16] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-500/[0.07] rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-accent-500/[0.07] rounded-full blur-[120px] animate-blob-delay" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-secondary-500/[0.05] rounded-full blur-[100px] animate-blob-delay-2" />

      <div className="w-full max-w-4xl relative z-10 animate-fade-in flex items-center gap-8">
        {/* Illustration (desktop only) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <AuthSideIllustration className="w-[500px] h-[500px]" />
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 mb-4 shadow-glow animate-pulse-soft">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">FinWise AI</h1>
          <p className="text-sm text-gray-500 mt-1">Smart money management</p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
          <h2 className="text-lg font-semibold text-white mb-5">Welcome back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-xl text-white text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/40 transition-all ${errors.email ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-primary-500/60'}`}
                  placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                  className={`w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border rounded-xl text-white text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/40 transition-all ${errors.password ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-primary-500/60'}`}
                  placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5 text-gray-400">
                <input type="checkbox" className="rounded border-white/20 bg-white/[0.04] text-primary-500 focus:ring-primary-500/40 w-3.5 h-3.5" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors font-medium">Forgot?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full font-medium text-sm shadow-glow hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="px-3 bg-transparent text-[11px] text-gray-500">Or continue with</span></div>
          </div>

          {/* Social */}
          <div className="space-y-2.5">
            <button onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.07] transition-all text-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-300 font-medium">Google</span>
            </button>

            <button onClick={handleBiometricLogin}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl hover:bg-white/[0.07] transition-all text-sm">
              <Fingerprint className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300 font-medium">Passkey</span>
            </button>
          </div>

          <p className="mt-5 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">Sign up</Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
