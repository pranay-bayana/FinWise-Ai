import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { completeSupabaseOAuth } = useAuth();
  const hasStartedExchange = useRef(false);

  useEffect(() => {
    let mounted = true;

    const finishLogin = async () => {
      if (hasStartedExchange.current) {
        console.log('[OAuth] duplicate callback execution prevented');
        return;
      }
      hasStartedExchange.current = true;
      
      try {
        console.log('[OAuth] callback component exchange requested');
        await completeSupabaseOAuth();
        if (!mounted) {
          return;
        }
        toast.success('Google login successful!');
        console.log('[OAuth] navigation to dashboard');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('[OAuth] callback failed:', error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unknown error');
        console.error('[OAuth] callback failure status:', error?.response?.status || 'no-response');
        if (!mounted) return;
        toast.error(error.message || 'Google login failed');
        console.log('[OAuth] navigation to login');
        navigate('/login', { replace: true });
      }
    };

    finishLogin();

    return () => {
      mounted = false;
    };
  }, [completeSupabaseOAuth, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#080b16]">
      <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
    </div>
  );
};

export default AuthCallback;
