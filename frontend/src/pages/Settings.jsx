import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { offlineStore } from '../services/offlineStore';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Lock, Moon, Sun, Bell, Fingerprint, Shield, LogOut } from 'lucide-react';

const Settings = () => {
  const { user, logout, biometricRegister } = useAuth();
  const { darkMode, toggleDarkMode, isInitialized: themeInitialized } = useTheme();
  const offline = import.meta.env.VITE_OFFLINE === 'true';
  const [settings, setSettings] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '',
    avatarUrl: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getSettings();
      setSettings(data.settings);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    try {
      if (!window.PublicKeyCredential) {
        toast.error('Passkeys not supported on this device/browser');
        return;
      }
      await biometricRegister();
      toast.success('Passkey enabled for this device');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enable passkey');
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await settingsService.getProfile();
      setProfile(data.user);
      setProfileForm({
        fullName: data.user.full_name || '',
        phone: data.user.phone || '',
        avatarUrl: data.user.avatar_url || ''
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await settingsService.updateProfile(profileForm);
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleUpdateSettings = async (key, value) => {
    try {
      await settingsService.updateSettings({ [key]: value });
      setSettings({ ...settings, [key]: value });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await settingsService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 rounded-full border-2 border-primary-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'profile'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'security'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Security
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === 'preferences'
              ? 'border-primary-600 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Preferences
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Profile Information</h2>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div>
                <button type="button" className="btn-secondary text-sm">
                  Change Photo
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG. Max 5MB</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="input-field pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-field pl-10 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="input-field pl-10"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Change Password</h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Update Password
              </button>
            </form>
          </div>

          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Biometric Authentication</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Passkey (Device Biometrics)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable Face/Touch ID via passkeys (recommended)
                    </p>
                  </div>
                </div>
                <button type="button" onClick={handleRegisterPasskey} className="btn-secondary text-sm">
                  Enable
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Fingerprint className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Fingerprint Unlock</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use fingerprint to unlock the app</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateSettings('fingerprint_unlock', !settings?.fingerprint_unlock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.fingerprint_unlock ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.fingerprint_unlock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Face Unlock</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Use face recognition to unlock</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateSettings('face_unlock', !settings?.face_unlock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.face_unlock ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.face_unlock ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          {offline && (
            <div className="card p-6 border border-yellow-200 dark:border-yellow-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Offline Mode</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Your data is stored locally in this browser. Use reset if you want to clear all local data and start from zero.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('Are you sure you want to reset all offline data? This action cannot be undone and will delete all local data.')) return;
                  offlineStore.reset();
                  toast.success('Offline data reset');
                  fetchSettings();
                  fetchProfile();
                }}
                className="px-4 py-2 rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
              >
                Reset Offline Data
              </button>
            </div>
          )}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">App Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch to dark theme</p>
                  </div>
                </div>
                <button
                  onClick={toggleDarkMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable push notifications</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateSettings('notification_enabled', !settings?.notification_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.notification_enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.notification_enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Hide Balance</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hide balance amounts in the app</p>
                  </div>
                </div>
                <button
                  onClick={() => handleUpdateSettings('hide_balance', !settings?.hide_balance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings?.hide_balance ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings?.hide_balance ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Auto Lock</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically lock app after inactivity</p>
                  </div>
                </div>
                <select
                  value={settings?.auto_lock_minutes || 5}
                  onChange={(e) => handleUpdateSettings('auto_lock_minutes', parseInt(e.target.value))}
                  className="input-field w-24"
                >
                  <option value="1">1 min</option>
                  <option value="5">5 min</option>
                  <option value="10">10 min</option>
                  <option value="30">30 min</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4">Danger Zone</h2>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
