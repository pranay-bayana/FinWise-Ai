import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { Wallet, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react';
import { AuthSideIllustration } from '../assets/images/auth/AuthSideIllustration.jsx';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    // Phone is optional - only validate if provided
    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register({ fullName: formData.fullName, email: formData.email, phone: formData.phone, password: formData.password });
      toast.success('Registration successful!'); navigate('/dashboard');
    } catch (error) { toast.error(error.response?.data?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const getInputCls = (fieldName) => `w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border rounded-xl text-white text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/40 transition-all ${errors[fieldName] ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-primary-500/60'}`;
  const getInputPwCls = (fieldName) => `w-full pl-10 pr-10 py-2.5 bg-white/[0.04] border rounded-xl text-white text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-primary-500/40 transition-all ${errors[fieldName] ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.08] focus:border-primary-500/60'}`;

  return (
    <div className="min-h-screen bg-[#080b16] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary-500/[0.07] rounded-full blur-[120px] animate-blob" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[400px] h-[400px] bg-accent-500/[0.07] rounded-full blur-[120px] animate-blob-delay" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-secondary-500/[0.05] rounded-full blur-[100px] animate-blob-delay-2" />

      <div className="w-full max-w-4xl relative z-10 animate-fade-in flex items-center gap-8">
        {/* Illustration (desktop only) */}
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <AuthSideIllustration className="w-[500px] h-[500px]" />
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 mb-3 shadow-glow animate-pulse-soft">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Start managing your finances</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-6">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required className={getInputCls('fullName')} placeholder="John Doe" />
              </div>
              {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className={getInputCls('email')} placeholder="you@example.com" />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone <span className="text-gray-600">(optional)</span></label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={getInputCls('phone')} placeholder="+91 98765 43210" />
              </div>
              {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required className={getInputPwCls('password')} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className={getInputPwCls('confirmPassword')} placeholder="••••••••" />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-400 mt-1">{errors.confirmPassword}</p>}
            </div>
            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" required className="mt-0.5 rounded border-white/20 bg-white/[0.04] text-primary-500 focus:ring-primary-500/40 w-3.5 h-3.5" />
              <span className="text-[11px] text-gray-500">
                I agree to the <Link to="/terms" className="text-primary-400 hover:text-primary-300">Terms</Link> and <Link to="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</Link>
              </span>
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full font-medium text-sm shadow-glow hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-gray-500">
            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;
