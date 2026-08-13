const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const supabase = require('../config/database');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Register User
exports.register = async (req, res) => {
  try {
    const { email, password, fullName, phone } = req.body;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        phone
      })
      .select()
      .single();

    if (error) throw error;

    // Create default settings
    await supabase.from('user_settings').insert({
      user_id: user.id
    });

    // Create default expense categories
    const defaultCategories = [
      { name: 'Food', icon: '🍔', color: '#FF6B6B', user_id: user.id },
      { name: 'Petrol', icon: '⛽', color: '#4ECDC4', user_id: user.id },
      { name: 'Shopping', icon: '🛍️', color: '#A8E6CF', user_id: user.id },
      { name: 'Bills', icon: '📄', color: '#FFD93D', user_id: user.id },
      { name: 'Entertainment', icon: '🎬', color: '#6C5CE7', user_id: user.id },
      { name: 'Medical', icon: '💊', color: '#E17055', user_id: user.id },
      { name: 'Travel', icon: '✈️', color: '#00CEC9', user_id: user.id },
      { name: 'Rent', icon: '🏠', color: '#FD79A8', user_id: user.id },
      { name: 'Insurance', icon: '🛡️', color: '#74B9FF', user_id: user.id },
      { name: 'Investments', icon: '📈', color: '#55EFC4', user_id: user.id }
    ];

    await supabase.from('expense_categories').insert(defaultCategories);

    // Create default income categories
    const defaultIncomeCategories = [
      { name: 'Salary', icon: '💰', color: '#00B894', user_id: user.id },
      { name: 'Freelancing', icon: '💻', color: '#0984E3', user_id: user.id },
      { name: 'Business', icon: '🏢', color: '#6C5CE7', user_id: user.id },
      { name: 'Side Income', icon: '💎', color: '#FD79A8', user_id: user.id },
      { name: 'Investments', icon: '📊', color: '#00CEC9', user_id: user.id }
    ];

    await supabase.from('income_categories').insert(defaultIncomeCategories);

    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

// Login User
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        phone: user.phone,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Google OAuth
exports.googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    let user;
    if (existingUser) {
      // Update user if exists
      const { data: updatedUser } = await supabase
        .from('users')
        .update({
          full_name: name,
          avatar_url: picture,
          google_id: payload.sub,
          is_verified: true
        })
        .eq('id', existingUser.id)
        .select()
        .single();
      user = updatedUser;
    } else {
      // Create new user
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          email,
          full_name: name,
          avatar_url: picture,
          google_id: payload.sub,
          is_verified: true
        })
        .select()
        .single();
      user = newUser;

      // Create default settings
      await supabase.from('user_settings').insert({
        user_id: user.id
      });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Google login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ error: 'Google login failed' });
  }
};

// Biometric Login (simulated - in production, this would use device-specific biometric APIs)
exports.biometricLogin = async (req, res) => {
  try {
    const { userId, biometricData } = req.body;

    // In production, verify biometric data using device-specific APIs
    // For now, we'll just check if user exists
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Check if biometric is enabled
    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!settings || (!settings.fingerprint_unlock && !settings.face_unlock)) {
      return res.status(400).json({ error: 'Biometric not enabled' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Biometric login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error) {
    console.error('Biometric login error:', error);
    res.status(500).json({ error: 'Biometric login failed' });
  }
};

// Verify Token
exports.verifyToken = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, avatar_url')
      .eq('id', req.user.userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};
