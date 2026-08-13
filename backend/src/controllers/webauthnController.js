// src/controllers/webauthnController.js
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';
import { supabase } from '../services/supabaseClient.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../services/jwtService.js';

const rpName = process.env.WEBAUTHN_RP_NAME || 'Finance Tracker';
const rpID = process.env.WEBAUTHN_RP_ID || 'localhost';
const origin = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000';

const registrationChallenges = new Map(); // userId -> challenge
const loginChallenges = new Map(); // email -> challenge

const toBuffer = (base64url) => Buffer.from(base64url, 'base64url');
const fromBuffer = (buf) => Buffer.from(buf).toString('base64url');

const issueToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
const getUserSafe = async (userId) => {
  const { data } = await supabase
    .from('users')
    .select('id,email,full_name,avatar_url,created_at')
    .eq('id', userId)
    .single();
  return data ?? null;
};

export const startRegistration = async (req, res) => {
  const userId = req.user.id;
  const { data: user, error } = await supabase.from('users').select('email').eq('id', userId).single();
  if (error || !user) return res.status(404).json({ message: 'User not found' });

  const { data: existingCreds } = await supabase
    .from('user_webauthn_credentials')
    .select('credential_id')
    .eq('user_id', userId);

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: userId,
    userName: user.email,
    timeout: 60_000,
    attestationType: 'none',
    excludeCredentials: (existingCreds || []).map((c) => ({
      id: toBuffer(c.credential_id),
      type: 'public-key',
    })),
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred',
    },
  });

  registrationChallenges.set(userId, options.challenge);
  return res.json(options);
};

export const finishRegistration = async (req, res) => {
  const userId = req.user.id;
  const expectedChallenge = registrationChallenges.get(userId);
  if (!expectedChallenge) return res.status(400).json({ message: 'No registration in progress' });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });
  } catch (e) {
    return res.status(400).json({ message: 'Registration verification failed' });
  } finally {
    registrationChallenges.delete(userId);
  }

  const { verified, registrationInfo } = verification;
  if (!verified || !registrationInfo) return res.status(400).json({ message: 'Not verified' });

  const { credentialID, credentialPublicKey, counter } = registrationInfo;
  const payload = {
    user_id: userId,
    credential_id: fromBuffer(credentialID),
    public_key: fromBuffer(credentialPublicKey),
    counter,
    transports: req.body?.response?.transports ?? null,
  };

  const { error } = await supabase.from('user_webauthn_credentials').insert(payload);
  if (error) return res.status(500).json({ message: 'Failed to store credential', details: error.message });

  return res.json({ ok: true });
};

export const startLogin = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'email required' });

  const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
  if (!user?.id) return res.status(404).json({ message: 'User not found' });

  const { data: creds } = await supabase
    .from('user_webauthn_credentials')
    .select('credential_id')
    .eq('user_id', user.id);

  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60_000,
    userVerification: 'preferred',
    allowCredentials: (creds || []).map((c) => ({ id: toBuffer(c.credential_id), type: 'public-key' })),
  });

  loginChallenges.set(email, options.challenge);
  return res.json({ ...options, userId: user.id });
};

export const finishLogin = async (req, res) => {
  const { email, userId, response } = req.body;
  if (!email || !userId || !response) return res.status(400).json({ message: 'email, userId, response required' });

  const expectedChallenge = loginChallenges.get(email);
  if (!expectedChallenge) return res.status(400).json({ message: 'No login in progress' });

  const credentialId = response?.id;
  if (!credentialId) return res.status(400).json({ message: 'Missing credential id' });

  const { data: cred } = await supabase
    .from('user_webauthn_credentials')
    .select('*')
    .eq('user_id', userId)
    .eq('credential_id', credentialId)
    .single();

  if (!cred) return res.status(401).json({ message: 'Credential not registered' });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: toBuffer(cred.credential_id),
        credentialPublicKey: toBuffer(cred.public_key),
        counter: cred.counter ?? 0,
        transports: cred.transports ?? undefined,
      },
    });
  } catch (e) {
    return res.status(401).json({ message: 'Authentication verification failed' });
  } finally {
    loginChallenges.delete(email);
  }

  if (!verification.verified) return res.status(401).json({ message: 'Not verified' });

  const newCounter = verification.authenticationInfo?.newCounter;
  if (typeof newCounter === 'number') {
    await supabase.from('user_webauthn_credentials').update({ counter: newCounter }).eq('id', cred.id);
  }

  const token = issueToken(userId);
  const user = await getUserSafe(userId);
  return res.json({ token, user });
};
