const supabase = require('../config/database');

// Get user data
exports.getUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, avatar_url, is_verified, created_at')
      .eq('id', userId)
      .single();

    if (error) throw error;

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
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

    res.json({ message: 'User updated', user });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Delete user account
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
};
