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
        return;
      }
      hasStartedExchange.current = true;
      
      try {
        await completeSupabaseOAuth();
        if (!mounted) {
          return;
        }
        toast.success('Google login successful!');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('[AuthCallback] finishLogin caught error:', error);
        if (!mounted) return;
        toast.error(error.message || 'Google login failed');
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
