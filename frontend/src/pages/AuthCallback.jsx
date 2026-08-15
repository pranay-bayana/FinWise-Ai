import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { completeSupabaseOAuth } = useAuth();
  const hasRun = React.useRef(false);

  useEffect(() => {
    let mounted = true;

    const finishLogin = async () => {
      if (hasRun.current) return;
      hasRun.current = true;
      
      console.log('[AuthCallback] finishLogin started. URL search:', window.location.search);
      try {
        console.log('[AuthCallback] calling completeSupabaseOAuth...');
        await completeSupabaseOAuth();
        console.log('[AuthCallback] completeSupabaseOAuth finished successfully');
        if (!mounted) {
          console.log('[AuthCallback] component unmounted before navigate, aborting');
          return;
        }
        toast.success('Google login successful!');
        console.log('[AuthCallback] navigating to /dashboard');
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error('[AuthCallback] finishLogin caught error:', error);
        if (!mounted) return;
        toast.error(error.message || 'Google login failed');
        navigate('/login', { replace: true });
      }
    };

    console.log('[AuthCallback] useEffect calling finishLogin()');
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
