// src/controllers/authController.js
import { supabase } from '../services/supabaseClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../services/jwtService.js';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Helper to create JWT
const createToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

const getUserSafe = async (userId) => {
  const { data } = await supabase
    .from('users')
    .select('id,email,full_name,avatar_url,created_at')
    .eq('id', userId)
    .single();
  return data ?? null;
};

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

export const signup = async (req, res) => {
  const { email, password, fullName, phone } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  // Check if user exists
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();
  if (existing) {
    return res.status(409).json({ message: 'User already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const { data, error } = await supabase
    .from('users')
    .insert({ email, password_hash: hashed, full_name: fullName || null, phone: phone || null })
    .select('id')
    .single();
  if (error) {
    console.error(error);
    return res.status(500).json({ message: 'Signup failed' });
  }
  const userId = data.id;
  const token = createToken(userId);
  const user = await getUserSafe(userId);
  res.status(201).json({ token, user });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }
  const { data: user, error } = await supabase
    .from('users')
    .select('id, password_hash')
    .eq('email', email)
    .single();
  if (error || !user || !user.password_hash) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const passwordHash = String(user.password_hash);
  const valid = await bcrypt.compare(password, passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = createToken(user.id);
  const safe = await getUserSafe(user.id);
  res.json({ token, user: safe });
};

export const googleLogin = async (req, res) => {
  const { id_token } = req.body;
  if (!id_token) return res.status(400).json({ message: 'id_token required' });
  if (!googleClient) return res.status(500).json({ message: 'GOOGLE_CLIENT_ID not configured' });

  let ticket;
  try {
    ticket = await googleClient.verifyIdToken({ idToken: id_token, audience: googleClientId });
  } catch (e) {
    return res.status(401).json({ message: 'Invalid Google token' });
  }

  const payload = ticket.getPayload();
  const email = payload?.email;
  const googleId = payload?.sub;
  const fullName = payload?.name ?? null;
  const avatarUrl = payload?.picture ?? null;
  if (!email || !googleId) return res.status(401).json({ message: 'Invalid Google token payload' });

  const { data: existing } = await supabase.from('users').select('id').eq('email', email).single();
  if (existing?.id) {
    await supabase.from('users').update({ google_id: googleId, full_name: fullName, avatar_url: avatarUrl }).eq('id', existing.id);
    const token = createToken(existing.id);
    const safe = await getUserSafe(existing.id);
    return res.json({ token, user: safe });
  }

  const { data, error } = await supabase
    .from('users')
    .insert({ email, google_id: googleId, full_name: fullName, avatar_url: avatarUrl, is_verified: true })
    .select('id')
    .single();
  if (error) return res.status(500).json({ message: 'Google login failed', details: error.message });

  const token = createToken(data.id);
  const safe = await getUserSafe(data.id);
  return res.json({ token, user: safe });
};

export const supabaseOAuthLogin = async (req, res) => {
  const { access_token: accessToken } = req.body;
  if (!accessToken) return res.status(400).json({ message: 'access_token required' });

  const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
  if (authError || !authData?.user) {
    return res.status(401).json({ message: 'Invalid Supabase session' });
  }

  const authUser = authData.user;
  const email = authUser.email;
  const googleIdentity = authUser.identities?.find((identity) => identity.provider === 'google');
  const googleId = googleIdentity?.id ?? authUser.app_metadata?.provider_id ?? authUser.id;
  const metadata = authUser.user_metadata ?? {};
  const fullName = metadata.full_name || metadata.name || null;
  const avatarUrl = metadata.avatar_url || metadata.picture || null;

  if (!email) return res.status(401).json({ message: 'Supabase user email is missing' });

  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (findError) {
    return res.status(500).json({ message: 'Google login failed', details: findError.message });
  }

  let userId = existing?.id;

  if (userId) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ google_id: googleId, full_name: fullName, avatar_url: avatarUrl, is_verified: true })
      .eq('id', userId);
    if (updateError) {
      return res.status(500).json({ message: 'Google login failed', details: updateError.message });
    }
  } else {
    const { data: inserted, error: insertError } = await supabase
      .from('users')
      .insert({ email, google_id: googleId, full_name: fullName, avatar_url: avatarUrl, is_verified: true })
      .select('id')
      .single();
    if (insertError) {
      return res.status(500).json({ message: 'Google login failed', details: insertError.message });
    }
    userId = inserted.id;
  }

  const token = createToken(userId);
  const safe = await getUserSafe(userId);
  return res.json({ token, user: safe });
};

export const logout = (req, res) => {
  // Client can simply drop token; optionally blacklist token server‑side
  res.json({ message: 'Logged out' });
};

export const verify = async (req, res) => {
  const user = await getUserSafe(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const genericMessage = 'If an account exists with this email, a reset link has been sent.';

  const { data: user } = await supabase.from('users').select('id, email').eq('email', email).single();
  if (!user) {
    return res.json({ message: genericMessage });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await supabase.from('password_reset_tokens').delete().eq('user_id', user.id);
  const { error } = await supabase.from('password_reset_tokens').insert({
    user_id: user.id,
    token,
    expires_at: expiresAt,
  });

  if (error) {
    console.error('Failed to create reset token:', error.message);
    return res.status(500).json({ message: 'Failed to process request' });
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

  if (resend && process.env.EMAIL_FROM) {
    try {
      await resend.emails.send({
        from: `FinWise AI <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: 'Reset Your FinWise AI Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #10b981;">FinWise AI</h2>
            <p>We received a request to reset your password. Click the button below to choose a new one:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold;">Reset Password</a>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError);
    }
  } else {
    console.warn('RESEND_API_KEY or EMAIL_FROM not configured. Reset email was not sent.');
  }

  const payload = { message: genericMessage };
  
  if (process.env.NODE_ENV !== 'production') {
    payload.resetToken = token;
    payload.resetUrl = resetUrl;
  }
  
  return res.json(payload);
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: 'Token and new password are required' });
  if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters' });

  const { data: resetRow, error } = await supabase
    .from('password_reset_tokens')
    .select('id, user_id, expires_at, used')
    .eq('token', token)
    .single();

  if (error || !resetRow || resetRow.used) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }
  if (new Date(resetRow.expires_at) < new Date()) {
    return res.status(400).json({ message: 'Reset token has expired' });
  }

  const password_hash = await bcrypt.hash(newPassword, 10);
  const { error: updateError } = await supabase.from('users').update({ password_hash }).eq('id', resetRow.user_id);
  if (updateError) return res.status(500).json({ message: 'Password update failed' });

  await supabase.from('password_reset_tokens').update({ used: true }).eq('id', resetRow.id);
  return res.json({ message: 'Password reset successful' });
};
