import React, { useState, useEffect } from 'react';
import { Bell, Palette, Lock, RotateCcw, Loader } from 'lucide-react';
import PageContainer from '@/components/layout/PageContainer';
import { logger } from '../../services/logger';
import Button from '@/components/ui/Button';
import {
  notifyReducedMotionSettingsChanged,
  ReduceMotionPreference,
} from '@/hooks/useReducedMotion';
import { startOnboardingTour } from '@/hooks/useOnboarding';

interface Settings {
  tipNotifications: boolean;
  leaderboardNotifications: boolean;
  systemNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'es' | 'fr';
  currency: 'USD' | 'EUR' | 'XLM';
  publicProfile: boolean;
  showOnLeaderboard: boolean;
  reduceMotion: ReduceMotionPreference;
}

const DEFAULT_SETTINGS: Settings = {
  tipNotifications: true,
  leaderboardNotifications: true,
  systemNotifications: true,
  theme: 'auto',
  language: 'en',
  currency: 'USD',
  publicProfile: true,
  showOnLeaderboard: true,
  reduceMotion: 'auto',
};

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('tipz_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        logger.error('features/settings/SettingsPage', 'Failed to load settings', undefined, e instanceof Error ? e : new Error(String(e)));
      }
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('tipz_settings', JSON.stringify(settings));
      notifyReducedMotionSettingsChanged();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('tipz_settings');
      notifyReducedMotionSettingsChanged();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleToggle = (key: keyof Settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  const handleChange = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <PageContainer maxWidth="md" ariaLabel="Settings content" className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {saveSuccess && (
          <div role="status" aria-live="polite" className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700">Settings saved successfully</p>
          </div>
        )}

        {/* Notifications Section */}
        <section role="region" aria-labelledby="notifications-heading" className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 id="notifications-heading" className="text-xl font-semibold">Notifications</h2>
            </div>
            <p className="text-sm text-gray-600">Manage your notification preferences</p>
          </div>

          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Tip Notifications</span>
              <input
                type="checkbox"
                checked={settings.tipNotifications}
                onChange={() => handleToggle('tipNotifications')}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Leaderboard Changes</span>
              <input
                type="checkbox"
                checked={settings.leaderboardNotifications}
                onChange={() => handleToggle('leaderboardNotifications')}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">System Updates</span>
              <input
                type="checkbox"
                checked={settings.systemNotifications}
                onChange={() => handleToggle('systemNotifications')}
                className="w-4 h-4"
              />
            </label>
          </div>
        </section>

        {/* Display Section */}
        <section role="region" aria-labelledby="display-heading" className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-purple-600" />
              <h2 id="display-heading" className="text-xl font-semibold">Display</h2>
            </div>
            <p className="text-sm text-gray-600">Customize your display preferences</p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency Display</label>
              <select
                value={settings.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="XLM">XLM</option>
              </select>
            </div>
          </div>
        </section>

        {/* Motion Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <RotateCcw className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-semibold">Motion</h2>
            </div>
            <p className="text-sm text-gray-600">
              Respect your motion preferences for page transitions and animations.
            </p>
          </div>

          <div className="p-6 space-y-3">
            <label className="flex items-center justify-between gap-3 border-2 border-black px-3 py-2">
              <span className="text-sm font-medium">Use device motion preference</span>
              <input
                type="radio"
                name="reduceMotion"
                value="auto"
                checked={settings.reduceMotion === 'auto'}
                onChange={() => handleChange('reduceMotion', 'auto')}
                className="h-4 w-4 border-2 border-black accent-black"
              />
            </label>
            <label className="flex items-center justify-between gap-3 border-2 border-black px-3 py-2">
              <span className="text-sm font-medium">Always reduce motion</span>
              <input
                type="radio"
                name="reduceMotion"
                value="always"
                checked={settings.reduceMotion === 'always'}
                onChange={() => handleChange('reduceMotion', 'always')}
                className="h-4 w-4 border-2 border-black accent-black"
              />
            </label>
          </div>
        </div>

        {/* Onboarding Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Palette className="w-5 h-5 text-teal-600" />
              <h2 className="text-xl font-semibold">Onboarding</h2>
            </div>
            <p className="text-sm text-gray-600">
              Replay the guided tour anytime from your settings.
            </p>
          </div>

          <div className="p-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => startOnboardingTour()}
            >
              Replay onboarding tour
            </Button>
          </div>
        </div>

        {/* Privacy Section */}
        <section role="region" aria-labelledby="privacy-heading" className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-green-600" />
              <h2 id="privacy-heading" className="text-xl font-semibold">Privacy</h2>
            </div>
            <p className="text-sm text-gray-600">Control your profile visibility</p>
          </div>

          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Public Profile</span>
              <input
                type="checkbox"
                checked={settings.publicProfile}
                onChange={() => handleToggle('publicProfile')}
                className="w-4 h-4"
              />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm font-medium">Show on Leaderboard</span>
              <input
                type="checkbox"
                checked={settings.showOnLeaderboard}
                onChange={() => handleToggle('showOnLeaderboard')}
                className="w-4 h-4"
              />
            </label>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>

          <button
            onClick={handleReset}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </PageContainer>
  );
};

export default SettingsPage;
