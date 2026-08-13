import { supabase } from '../services/supabaseClient.js';
import { isAdminEmail } from '../services/adminAccess.js';

export const requireAdmin = async (req, res, next) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', req.user.id)
    .single();

  if (error || !isAdminEmail(user?.email)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  req.user.email = user.email;
  return next();
};
