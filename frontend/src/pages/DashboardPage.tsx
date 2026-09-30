import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlerts } from '../hooks/useAlerts';
import { useAudioMonitor } from '../hooks/useAudioMonitor';
import { MonitoringStatus } from '../components/MonitoringStatus';
import { AlertHistory } from '../components/AlertHistory';
import { Shield, ShieldOff, AlertTriangle, Send, Beaker, PlayCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as settingsApi from '../api/settings';
import { SoundEventType, AlertEvent } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { alerts, sendManualAlert, sendSoundAlert, sendTestAlert } = useAlerts();
  const [isTabHidden, setIsTabHidden] = useState(document.hidden);
  const [demoEvent, setDemoEvent] = useState<AlertEvent | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const showMessage = (text: string, isError = false) => {
    setActionMessage({ text, isError });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const handleDetection = (eventType: SoundEventType, confidence: number) => {
    sendSoundAlert.mutate({
      eventType,
      confidence,
      occurredAt: new Date().toISOString(),
    }, {
      onSuccess: () => showMessage(`Sound detected: ${eventType.replace('_', ' ')} — alert sent`),
      onError: (err) => showMessage(`Alert failed: ${err.message}`, true),
    });
  };

  const { status, statusMessage, startMonitoring, stopMonitoring } = useAudioMonitor({
    onDetection: handleDetection,
    settings: settings || null,
  });

  useEffect(() => {
    const handleVisChange = () => setIsTabHidden(document.hidden);
    document.addEventListener('visibilitychange', handleVisChange);
    return () => document.removeEventListener('visibilitychange', handleVisChange);
  }, []);

  const handleManualAlert = () => {
    if (window.confirm(`EMERGENCY: This will immediately email your trusted contact. Continue?`)) {
      sendManualAlert.mutate(undefined, {
        onSuccess: () => showMessage('Emergency alert sent successfully'),
        onError: (err) => showMessage(`Alert failed: ${err.message}`, true),
      });
    }
  };

  const handleTestAlert = () => {
    if (window.confirm('Send a test email to your trusted contact? They will see this is a test.')) {
      sendTestAlert.mutate(undefined, {
        onSuccess: () => showMessage('Test email sent — check your contact\'s inbox'),
        onError: (err) => showMessage(`Test failed: ${err.message}`, true),
      });
    }
  };

  // Demo mode: simulates a detection event locally without microphone
  // NOT sent to the backend — purely a UI demonstration
  const runDemoDetection = () => {
    showMessage('[SIMULATED] Running demo detection in 3 seconds...');
    setTimeout(() => {
      const simEvent: AlertEvent = {
        id: `demo-${Date.now()}`,
        userId: user?.id || 'demo',
        eventType: 'smoke_alarm',
        source: 'sound',
        confidence: 0.96,
        occurredAt: new Date().toISOString(),
        deliveryStatus: 'pending',
        errorSummary: '[SIMULATED] This is a demo event — no real alert was sent',
      };
      setDemoEvent(simEvent);
      showMessage('[SIMULATED] Demo smoke alarm detected at 96% confidence. No real alert was sent.');
    }, 3000);
  };

  const isSending = sendManualAlert.isPending || sendSoundAlert.isPending || sendTestAlert.isPending;

  return (
    <div className="space-y-8 pb-12">
      <MonitoringStatus
        status={status}
        message={statusMessage}
        onStop={stopMonitoring}
        isTabHidden={isTabHidden}
      />

      {actionMessage && (
        <div
          className={`p-4 rounded-lg text-lg font-semibold ${actionMessage.isError ? 'bg-danger/20 border border-danger text-red-200' : 'bg-success/20 border border-success text-green-200'}`}
          role="alert"
          aria-live="polite"
        >
          {actionMessage.text}
        </div>
      )}

      {/* Monitoring Control */}
      <section className="bg-surface p-6 md:p-8 rounded-xl border border-gray-700 shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-6 flex justify-center items-center gap-3">
          {status === 'active' ? (
            <><Shield className="text-success" size={40} aria-hidden="true" /> Monitoring: ACTIVE</>
          ) : (
            <><ShieldOff className="text-gray-500" size={40} aria-hidden="true" /> Monitoring: STOPPED</>
          )}
        </h2>

        {(status === 'idle' || status === 'error' || status === 'unavailable') && (
          <div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              QuietGuard will ask for microphone access to listen for emergency sounds on your device.
              <strong className="block mt-2">No audio is ever sent to our servers — all processing is local.</strong>
            </p>
            {(status === 'unavailable' || status === 'error') && (
              <div className="bg-warning/20 border border-warning text-yellow-200 p-4 rounded-lg mb-6 max-w-2xl mx-auto" role="alert">
                {statusMessage}
              </div>
            )}
            <button
              onClick={startMonitoring}
              disabled={status === 'unavailable' || !settings}
              className="w-full md:w-auto bg-success text-gray-900 px-8 py-5 rounded-lg text-2xl font-bold hover:bg-green-400 focus:ring-4 focus:ring-green-300 transition-colors disabled:opacity-50"
              aria-disabled={status === 'unavailable'}
            >
              Start Monitoring
            </button>
          </div>
        )}
      </section>

      {/* Emergency Controls */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-danger" aria-hidden="true" /> Emergency Controls
          </h3>
          <button
            onClick={handleManualAlert}
            disabled={isSending}
            className="w-full bg-danger text-white px-6 py-6 rounded-lg text-xl font-bold hover:bg-red-600 focus:ring-4 focus:ring-red-400 transition-colors mb-4 flex justify-center items-center gap-3"
            aria-label="Send emergency alert to trusted contact"
          >
            <Send size={28} aria-hidden="true" />
            {sendManualAlert.isPending ? 'Sending Alert...' : 'Send Emergency Alert'}
          </button>
          <p className="text-gray-400 text-sm mb-4">
            Immediately emails your trusted contact with an urgent alert.
          </p>
          <button
            onClick={handleTestAlert}
            disabled={isSending}
            className="w-full bg-bg border border-gray-600 text-gray-200 px-6 py-4 rounded-lg text-lg font-bold hover:bg-gray-800 focus:ring-4 focus:ring-gray-500 transition-colors flex justify-center items-center gap-3"
            aria-label="Send test email to trusted contact"
          >
            <Beaker aria-hidden="true" />
            {sendTestAlert.isPending ? 'Sending Test...' : 'Send Test Email'}
          </button>
          <p className="text-gray-500 text-xs mt-2">
            Your contact will see this is marked as a test — not a real emergency.
          </p>
        </div>

        {/* Demo Mode */}
        <div className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PlayCircle className="text-accent" aria-hidden="true" /> Demo Mode
          </h3>
          <p className="text-gray-400 mb-6">
            Simulate a detection event to see how the UI behaves. <strong>No microphone or real alert is used.</strong>
          </p>
          <button
            onClick={runDemoDetection}
            className="w-full bg-accent text-white px-6 py-4 rounded-lg text-lg font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 transition-colors"
          >
            Run Demo Detection [SIMULATED]
          </button>
          {demoEvent && (
            <div className="mt-4 p-4 bg-bg border border-accent/50 rounded-lg text-sm">
              <p className="font-bold text-accent mb-1">⚗️ [SIMULATED] Detection Result:</p>
              <p>Type: {demoEvent.eventType.replace('_', ' ').toUpperCase()}</p>
              <p>Confidence: {((demoEvent.confidence ?? 0) * 100).toFixed(0)}%</p>
              <p className="text-gray-500 mt-1">{demoEvent.errorSummary}</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Recent Alerts</h3>
          <Link to="/alerts" className="text-accent hover:underline focus:ring-2 focus:ring-accent rounded px-2 py-1">
            View Full History →
          </Link>
        </div>
        <AlertHistory alerts={alerts.slice(0, 5)} />
      </section>
    </div>
  );
};