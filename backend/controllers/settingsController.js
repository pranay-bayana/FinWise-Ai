const supabase = require('../config/database');

// Get user settings
exports.getSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update settings
exports.updateSettings = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update(req.body)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'Settings updated', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, avatar_url, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { fullName, phone, avatarUrl } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl
      })
      .eq('id', userId)
      .select('id, email, full_name, phone, avatar_url')
      .single();

    if (error) throw error;

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Get current user
    const { data: user } = await supabase
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
