import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '../api/settings';
import * as contactsApi from '../api/contacts';
import { useAuth } from '../hooks/useAuth';
import { SoundEventType } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const { data: contact, isLoading: loadingContact } = useQuery({
    queryKey: ['contact'],
    queryFn: contactsApi.getContact,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showSaveMessage('Settings saved successfully');
    },
    onError: (err: any) => showSaveError(err.message),
  });

  const upsertContactMutation = useMutation({
    mutationFn: contactsApi.upsertContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact'] });
    },
    onError: (err: any) => showSaveError(err.message),
  });

  const showSaveMessage = (msg: string) => {
    setSaveMessage(msg);
    setSaveError('');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const showSaveError = (msg: string) => {
    setSaveError(msg);
    setSaveMessage('');
    setTimeout(() => setSaveError(''), 5000);
  };

  const [localSettings, setLocalSettings] = useState(settings);
  const [localContact, setLocalContact] = useState({ name: '', email: '', enabled: true });

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (contact) {
      setLocalContact({ name: contact.name, email: contact.email, enabled: contact.enabled });
    }
  }, [contact]);

  if (loadingSettings || loadingContact || !localSettings) {
    return <div className="p-8 text-center text-xl">Loading settings...</div>;
  }

  const handleToggleEvent = (event: SoundEventType) => {
    const enabled = localSettings.enabledEvents;
    const newEnabled = enabled.includes(event)
      ? enabled.filter(e => e !== event)
      : [...enabled, event];
    setLocalSettings({ ...localSettings, enabledEvents: newEnabled });
  };

  const handleSave = () => {
    updateSettingsMutation.mutate(localSettings);
    if (localContact.name && localContact.email) {
      upsertContactMutation.mutate(localContact);
    }
  };

  const SOUND_EVENTS: { id: SoundEventType; label: string; note?: string }[] = [
    { id: 'smoke_alarm', label: '🔥 Smoke Alarm' },
    { id: 'glass_break', label: '💥 Glass Breaking' },
    { id: 'distress', label: '📢 Distress Shout' },
    { id: 'loud_impact', label: '⚡ Loud Impact', note: '⚠️ Experimental heuristic — may trigger on any loud thud, not specifically falls.' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      {/* Profile */}
      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">My Profile</h2>
        <div className="grid gap-4">
          <div>
            <label className="block text-lg mb-2">Name</label>
            <input type="text" disabled value={user?.name || ''} className="w-full bg-bg border border-gray-600 rounded-lg p-3 text-gray-500 opacity-70 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-lg mb-2">Email</label>
            <input type="text" disabled value={user?.email || ''} className="w-full bg-bg border border-gray-600 rounded-lg p-3 text-gray-500 opacity-70 cursor-not-allowed" />
          </div>
        </div>
      </section>

      {/* Trusted Contact */}
      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Trusted Contact</h2>
        <p className="text-gray-400 mb-6 text-lg">This is the person who will receive emergency alerts on your behalf.</p>
        <div className="grid gap-4">
          <div>
            <label className="block text-lg mb-2" htmlFor="contactName">Contact's Full Name</label>
            <input
              id="contactName"
              type="text"
              value={localContact.name}
              onChange={e => setLocalContact({ ...localContact, name: e.target.value })}
              className="w-full bg-bg border border-gray-600 rounded-lg p-3 text-lg focus:ring-2 focus:ring-accent outline-none"
              placeholder="e.g. Jane Smith"
            />
          </div>
          <div>
            <label className="block text-lg mb-2" htmlFor="contactEmail">Contact's Email Address</label>
            <input
              id="contactEmail"
              type="email"
              value={localContact.email}
              onChange={e => setLocalContact({ ...localContact, email: e.target.value })}
              className="w-full bg-bg border border-gray-600 rounded-lg p-3 text-lg focus:ring-2 focus:ring-accent outline-none"
              placeholder="e.g. jane@example.com"
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="contactEnabled"
              checked={localContact.enabled}
              onChange={e => setLocalContact({ ...localContact, enabled: e.target.checked })}
              className="w-6 h-6 rounded text-accent focus:ring-accent bg-gray-700 border-gray-600"
            />
            <label htmlFor="contactEnabled" className="text-lg">Alerts enabled for this contact</label>
          </div>
        </div>
      </section>

      {/* Sound Events */}
      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Sound Event Detection</h2>
        <div className="space-y-6">
          {SOUND_EVENTS.map(({ id, label, note }) => (
            <div key={id} className="p-4 border border-gray-700 rounded-lg bg-bg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`enable-${id}`}
                    checked={localSettings.enabledEvents.includes(id)}
                    onChange={() => handleToggleEvent(id)}
                    className="w-6 h-6 rounded text-accent focus:ring-accent bg-gray-700 border-gray-600"
                  />
                  <label htmlFor={`enable-${id}`} className="text-xl font-medium">
                    {label}
                  </label>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-xs ml-9">
                  <label className="text-sm text-gray-400 whitespace-nowrap" htmlFor={`thresh-${id}`}>
                    Sensitivity: {((1.0 - (localSettings.thresholds[id] ?? 0.7)) * 100).toFixed(0)}%
                  </label>
                  <input
                    id={`thresh-${id}`}
                    type="range"
                    min="0.1" max="0.9" step="0.05"
                    disabled={!localSettings.enabledEvents.includes(id)}
                    value={1.0 - (localSettings.thresholds[id] ?? 0.7)}
                    onChange={(e) => {
                      const threshold = 1.0 - parseFloat(e.target.value);
                      setLocalSettings({
                        ...localSettings,
                        thresholds: { ...localSettings.thresholds, [id]: threshold }
                      });
                    }}
                    className="w-full disabled:opacity-50"
                    aria-label={`Sensitivity for ${label}`}
                  />
                </div>
              </div>
              {note && (
                <p className="mt-3 text-warning text-sm bg-warning/10 p-3 rounded border border-warning/30">
                  {note}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Advanced Settings */}
      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Advanced Settings</h2>

        <div className="mb-6">
          <label className="block text-lg font-medium mb-2" htmlFor="cooldown">Alert Cooldown (seconds)</label>
          <p className="text-gray-400 mb-3">Minimum time between automated alerts to avoid duplicates. Min 30, max 3600.</p>
          <input
            id="cooldown"
            type="number"
            min="30" max="3600"
            value={localSettings.cooldownSeconds}
            onChange={e => setLocalSettings({ ...localSettings, cooldownSeconds: Math.max(30, Math.min(3600, parseInt(e.target.value) || 30)) })}
            className="bg-bg border border-gray-600 rounded-lg p-3 text-lg w-full max-w-xs focus:ring-2 focus:ring-accent outline-none"
          />
        </div>

        <div className="flex items-start gap-3 mt-8">
          <input
            type="checkbox"
            id="locationSharing"
            checked={localSettings.locationSharing}
            onChange={e => setLocalSettings({ ...localSettings, locationSharing: e.target.checked })}
            className="w-6 h-6 rounded text-accent focus:ring-accent bg-gray-700 border-gray-600 mt-1"
          />
          <div>
            <label htmlFor="locationSharing" className="text-xl font-medium block">Enable Location Sharing</label>
            <p className="text-gray-400">If enabled and you consent, your approximate location will be included in alert emails to help your contact find you.</p>
          </div>
        </div>
      </section>

      {/* Save Bar */}
      <div className="sticky bottom-4 flex items-center justify-between bg-surface p-4 rounded-xl border border-gray-700 shadow-2xl gap-4">
        <div>
          {saveMessage && <span className="text-success font-bold text-lg" role="status">{saveMessage}</span>}
          {saveError && <span className="text-danger font-bold text-lg" role="alert">{saveError}</span>}
        </div>
        <button
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending || upsertContactMutation.isPending}
          className="bg-accent text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 transition-colors disabled:opacity-50"
        >
          {(updateSettingsMutation.isPending || upsertContactMutation.isPending) ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};