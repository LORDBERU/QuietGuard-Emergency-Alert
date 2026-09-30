import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, Lock, Bell, Heart, Activity, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LandingPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="py-12">
      <section className="text-center mb-16 px-4">
        <Shield className="w-24 h-24 text-accent mx-auto mb-6" />
        <h1 className="text-5xl font-extrabold mb-6">QuietGuard</h1>
        <p className="text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
          Emergency Sound Alerts for Peace of Mind. We listen for danger when you can't.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="bg-accent text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 transition-colors">
            Get Started
          </Link>
          <Link to="/login" className="bg-surface border-2 border-gray-600 text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-gray-800 focus:ring-4 focus:ring-gray-400 transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      <section className="bg-surface rounded-2xl p-8 mb-16 border border-gray-700">
        <div className="flex items-start gap-6">
          <Lock className="w-12 h-12 text-success flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Privacy First</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              All audio is processed locally on your device using advanced AI. No recordings are ever uploaded to our servers, keeping your privacy completely secure.
            </p>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <div className="bg-surface p-8 rounded-xl border border-gray-700 text-center">
          <Activity className="w-12 h-12 text-accent mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">1. We Listen</h3>
          <p className="text-gray-400">Keep QuietGuard open. It actively listens for smoke alarms, breaking glass, and distress sounds.</p>
        </div>
        <div className="bg-surface p-8 rounded-xl border border-gray-700 text-center">
          <Bell className="w-12 h-12 text-warning mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">2. We Detect</h3>
          <p className="text-gray-400">Our on-device AI identifies critical emergency sounds in real-time without delay.</p>
        </div>
        <div className="bg-surface p-8 rounded-xl border border-gray-700 text-center">
          <Heart className="w-12 h-12 text-danger mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">3. We Alert</h3>
          <p className="text-gray-400">We immediately send an email alert to your trusted emergency contact.</p>
        </div>
      </section>

      <section className="bg-gray-900 border-l-4 border-warning p-6 rounded-r-lg">
        <h2 className="text-xl font-bold text-warning mb-2 flex items-center gap-2">
          <AlertCircle className="w-6 h-6" /> Important Limitations
        </h2>
        <p className="text-gray-300 text-lg">
          QuietGuard works when your browser tab is open and active. It cannot monitor in the background, on a locked screen, or when your device is off. For always-on monitoring, a native mobile app would be required. Do not rely solely on QuietGuard for life-safety.
        </p>
      </section>
    </div>
  );
};

// Need AlertCircle icon too
import { AlertCircle } from 'lucide-react';