const fs = require('fs');
const path = require('path');

const projectRoot = 'C:\\Users\\adil\\.gemini\\antigravity\\scratch\\quietguard\\frontend';

const files = {
  'package.json': `{
  "name": "quietguard-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@tanstack/react-query": "^5.0.0",
    "@tensorflow-models/speech-commands": "^0.5.4",
    "@tensorflow/tfjs": "^4.0.0",
    "lucide-react": "^0.292.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "zustand": "^4.4.6"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.3.5",
    "typescript": "^5.2.2",
    "vite": "^5.0.0"
  }
}`,
  'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});`,
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`,
  'tsconfig.node.json': `{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}`,
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        accent: 'var(--color-accent)',
        danger: 'var(--color-danger)',
        warning: 'var(--color-warning)',
        success: 'var(--color-success)',
      }
    },
  },
  plugins: [],
}`,
  'postcss.config.js': `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`,
  '.env.example': `VITE_API_BASE_URL=`,
  '.gitignore': `node_modules
dist
dist-ssr
*.local
.env
.env.*
!.env.example
`,
  'index.html': `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>QuietGuard</title>
  </head>
  <body class="bg-bg text-gray-100 min-h-screen font-sans">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
  'public/favicon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  'src/main.tsx': `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`,
  'src/index.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-bg: #0f0f1a;
  --color-surface: #1a1a2e;
  --color-accent: #6366f1;
  --color-danger: #ef4444;
  --color-warning: #f59e0b;
  --color-success: #22c55e;
}

body {
  background-color: var(--color-bg);
  color: #f3f4f6;
  font-size: 1.125rem; /* text-lg minimum */
}

/* Ensure large touch targets */
button, a, input, select {
  min-height: 44px;
}
`,
  'src/types/index.ts': `export type SoundEventType = 'smoke_alarm' | 'glass_break' | 'distress' | 'loud_impact' | 'manual' | 'test';
export type DeliveryStatus = 'pending' | 'sent' | 'failed';
export type AlertSource = 'manual' | 'sound' | 'test';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AlertContact {
  id: string;
  userId: string;
  name: string;
  email: string;
  enabled: boolean;
}

export interface UserSettings {
  enabledEvents: SoundEventType[];
  thresholds: Record<SoundEventType, number>;
  cooldownSeconds: number;
  locationSharing: boolean;
}

export interface AlertEvent {
  id: string;
  userId: string;
  eventType: SoundEventType;
  source: AlertSource;
  confidence?: number;
  occurredAt: string;
  deliveryStatus: DeliveryStatus;
  providerMessageId?: string;
  errorSummary?: string;
  locationLat?: number;
  locationLng?: number;
}

export type MonitoringStatus = 'idle' | 'requesting-permission' | 'loading-model' | 'active' | 'error' | 'unavailable';
`,
  'src/store/authStore.ts': `import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));`,
  'src/api/client.ts': `const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

let csrfToken: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  const res = await fetch(\`\${BASE_URL}/api/auth/csrf-token\`, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken!;
}

export function clearCsrfToken() {
  csrfToken = null;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = \`\${BASE_URL}\${path}\`;
  const method = (options.method || 'GET').toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (isMutation) {
    const token = await getCsrfToken();
    headers['X-CSRF-Token'] = token;
  }
  
  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    if (res.status === 401) {
        // clear session or dispatch event in a real app
    }
    throw new Error(err.message || \`HTTP \${res.status}\`);
  }
  
  return res.json();
}`,
  'src/api/auth.ts': `import { apiFetch } from './client';
import { User } from '../types';

export const login = (data: any) => apiFetch<{user: User}>('/api/auth/login', { method: 'POST', body: JSON.stringify(data) });
export const register = (data: any) => apiFetch<{user: User}>('/api/auth/register', { method: 'POST', body: JSON.stringify(data) });
export const logout = () => apiFetch('/api/auth/logout', { method: 'POST' });
export const getMe = () => apiFetch<{user: User}>('/api/auth/me');`,
  'src/api/alerts.ts': `import { apiFetch } from './client';
import { AlertEvent } from '../types';

export const getAlerts = () => apiFetch<AlertEvent[]>('/api/alerts');
export const sendAlert = (data: any) => apiFetch<AlertEvent>('/api/alerts', { method: 'POST', body: JSON.stringify(data) });`,
  'src/api/contacts.ts': `import { apiFetch } from './client';
import { AlertContact } from '../types';

export const getContacts = () => apiFetch<AlertContact[]>('/api/contacts');
export const addContact = (data: any) => apiFetch<AlertContact>('/api/contacts', { method: 'POST', body: JSON.stringify(data) });
export const updateContact = (id: string, data: any) => apiFetch<AlertContact>(\`/api/contacts/\${id}\`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteContact = (id: string) => apiFetch(\`/api/contacts/\${id}\`, { method: 'DELETE' });`,
  'src/api/settings.ts': `import { apiFetch } from './client';
import { UserSettings } from '../types';

export const getSettings = () => apiFetch<UserSettings>('/api/settings');
export const updateSettings = (data: Partial<UserSettings>) => apiFetch<UserSettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) });`,
  'src/hooks/useAuth.ts': `import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import * as authApi from '../api/auth';
import { clearCsrfToken } from '../api/client';

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    authApi.getMe()
      .then((data) => {
        setUser(data.user);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [setUser, setLoading]);

  const login = async (data: any) => {
    const res = await authApi.login(data);
    setUser(res.user);
  };

  const register = async (data: any) => {
    const res = await authApi.register(data);
    setUser(res.user);
  };

  const logout = async () => {
    await authApi.logout();
    clearCsrfToken();
    setUser(null);
  };

  return { user, isLoading, login, register, logout };
}`,
  'src/hooks/useAudioMonitor.ts': `import { useState, useRef, useEffect, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import { SoundEventType, UserSettings, MonitoringStatus } from '../types';

export interface AudioMonitorOptions {
  onDetection: (eventType: SoundEventType, confidence: number) => void;
  settings: UserSettings | null;
}

const YAMNET_MODEL_URL = 'https://tfhub.dev/google/tfjs-model/yamnet/tfjs/1/default/1';

const CLASS_MAP: Record<number, SoundEventType> = {
  400: 'smoke_alarm', 401: 'smoke_alarm', 402: 'smoke_alarm',
  135: 'glass_break',
  75: 'distress', 76: 'distress', 77: 'distress',
  463: 'loud_impact',
};

export function useAudioMonitor(options: AudioMonitorOptions) {
  const [status, setStatus] = useState<MonitoringStatus>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const modelRef = useRef<tf.GraphModel | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const { onDetection, settings } = options;

  const lastAlertTimes = useRef<Record<string, number>>({});
  const detectionHistory = useRef<Record<string, number>>({});
  const sampleBufferRef = useRef<number[]>([]);

  const loadModel = async () => {
    try {
      setStatus('loading-model');
      setStatusMessage('Loading detection model...');
      const model = await tf.loadGraphModel(YAMNET_MODEL_URL, { fromTFHub: true });
      modelRef.current = model;
      setIsModelLoaded(true);
      return true;
    } catch (e) {
      console.error(e);
      setStatus('unavailable');
      setStatusMessage('Sound detection model could not be loaded. Manual emergency alerts are still available.');
      return false;
    }
  };

  const processAudio = useCallback((e: AudioProcessingEvent) => {
    if (!modelRef.current || !settings) return;
    const inputBuffer = e.inputBuffer.getChannelData(0);
    
    // YAMNet expects 16kHz, 15600 samples (0.975s)
    sampleBufferRef.current.push(...Array.from(inputBuffer));
    
    if (sampleBufferRef.current.length >= 15600) {
        const samplesToProcess = sampleBufferRef.current.slice(0, 15600);
        sampleBufferRef.current = sampleBufferRef.current.slice(15600);
        
        tf.tidy(() => {
          const tensor = tf.tensor1d(samplesToProcess);
          const prediction = modelRef.current!.predict(tensor) as tf.Tensor;
          const scores = prediction.dataSync();
          
          let detectedEventType: SoundEventType | null = null;
          let highestConf = 0;
    
          for (const [classIdx, eventType] of Object.entries(CLASS_MAP)) {
            if (!settings.enabledEvents.includes(eventType)) continue;
            const conf = scores[parseInt(classIdx)];
            const threshold = settings.thresholds[eventType] || 0.5;
            if (conf > threshold && conf > highestConf) {
               highestConf = conf;
               detectedEventType = eventType;
            }
          }
    
          if (detectedEventType) {
            detectionHistory.current[detectedEventType] = (detectionHistory.current[detectedEventType] || 0) + 1;
            if (detectionHistory.current[detectedEventType] >= 3) {
               const now = Date.now();
               const lastTime = lastAlertTimes.current[detectedEventType] || 0;
               if (now - lastTime > (settings.cooldownSeconds * 1000)) {
                   lastAlertTimes.current[detectedEventType] = now;
                   onDetection(detectedEventType, highestConf);
                   detectionHistory.current[detectedEventType] = 0;
               }
            }
          } else {
            detectionHistory.current = {};
          }
        });
    }
  }, [settings, onDetection]);

  const startMonitoring = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setStatus('error');
        setStatusMessage('No microphone was detected. Please connect a microphone and try again.');
        return;
    }
    
    let modelLoaded = isModelLoaded;
    if (!modelLoaded) {
       modelLoaded = await loadModel();
       if (!modelLoaded) return;
    }

    try {
      setStatus('requesting-permission');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      // Deprecated but widely supported. AudioWorklet is better but more complex.
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      processor.onaudioprocess = processAudio;
      
      source.connect(processor);
      processor.connect(audioCtx.destination);
      processorRef.current = processor;
      
      setStatus('active');
      setStatusMessage('Monitoring is active. Listening for emergency sounds.');
    } catch (e) {
      console.error(e);
      setStatus('error');
      setStatusMessage('Microphone access was denied. Please allow microphone access in your browser settings and try again.');
    }
  };

  const stopMonitoring = useCallback(() => {
    if (processorRef.current) {
       processorRef.current.disconnect();
       processorRef.current = null;
    }
    if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
    }
    if (audioContextRef.current) {
       audioContextRef.current.close();
       audioContextRef.current = null;
    }
    setStatus('idle');
    setStatusMessage('Monitoring stopped');
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && status === 'active') {
         // UI should show a warning
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopMonitoring();
    };
  }, [status, stopMonitoring]);

  return { status, statusMessage, startMonitoring, stopMonitoring, isModelLoaded };
}`,
  'src/hooks/useAlerts.ts': `import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as alertsApi from '../api/alerts';
import { AlertEvent } from '../types';

export function useAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
  });

  const sendAlert = useMutation({
    mutationFn: alertsApi.sendAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return { alerts, isLoading, sendAlert };
}`,
  'src/components/ProtectedRoute.tsx': `import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-8 text-center text-xl">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};`,
  'src/components/Layout.tsx': `import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings, History, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-gray-800 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-accent font-bold text-2xl hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1">
            <Shield size={32} />
            QuietGuard
          </Link>
          
          {user && (
            <nav className="flex gap-4 flex-wrap">
              <Link to="/dashboard" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                <LayoutDashboard /> Dashboard
              </Link>
              <Link to="/alerts" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                <History /> History
              </Link>
              <Link to="/settings" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                <Settings /> Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded text-danger focus:outline-none focus:ring-2 focus:ring-danger">
                <LogOut /> Sign Out
              </button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-4">
        <div className="max-w-5xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
      
      <footer className="p-6 text-center text-gray-500 bg-surface text-sm border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <p>QuietGuard is a local sound detection tool. It is not a replacement for professional monitoring services or emergency services.</p>
        </div>
      </footer>
    </div>
  );
};`,
  'src/components/MonitoringStatus.tsx': `import React from 'react';
import { Activity, XCircle, AlertCircle } from 'lucide-react';
import { MonitoringStatus as StatusType } from '../types';

interface Props {
  status: StatusType;
  message: string;
  onStop: () => void;
  isTabHidden: boolean;
}

export const MonitoringStatus: React.FC<Props> = ({ status, message, onStop, isTabHidden }) => {
  if (status !== 'active' && status !== 'loading-model' && status !== 'requesting-permission') return null;

  return (
    <div className="mb-6">
      <div className="bg-success text-gray-900 p-4 rounded-lg flex items-center justify-between shadow-lg" role="alert" aria-live="assertive">
        <div className="flex items-center gap-3">
          <Activity className="animate-pulse" size={28} />
          <span className="font-bold text-lg md:text-xl">
            {status === 'active' ? '🟢 Monitoring is ACTIVE' : '⏳ ' + message}
          </span>
        </div>
        {status === 'active' && (
          <button 
            onClick={onStop}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 focus:ring-2 focus:ring-white focus:outline-none"
            aria-label="Stop Monitoring"
          >
            <XCircle /> <span className="hidden sm:inline">Stop</span>
          </button>
        )}
      </div>
      
      {status === 'active' && isTabHidden && (
        <div className="mt-2 bg-warning text-gray-900 p-3 rounded-lg flex items-start gap-3" role="alert">
          <AlertCircle className="flex-shrink-0" />
          <p className="font-semibold">Warning: Monitoring may pause when this tab is hidden. Keep this tab active and visible for reliable monitoring.</p>
        </div>
      )}
    </div>
  );
};`,
  'src/components/SoundEventCard.tsx': `import React from 'react';
import { AlertEvent } from '../types';
import { Smartphone, Mic, Beaker, CheckCircle, XCircle, Clock } from 'lucide-react';

export const SoundEventCard: React.FC<{ event: AlertEvent }> = ({ event }) => {
  const getSourceIcon = () => {
    switch(event.source) {
      case 'manual': return <Smartphone className="text-accent" />;
      case 'sound': return <Mic className="text-warning" />;
      case 'test': return <Beaker className="text-gray-400" />;
    }
  };

  const getStatusIcon = () => {
    switch(event.deliveryStatus) {
      case 'sent': return <CheckCircle className="text-success" />;
      case 'failed': return <XCircle className="text-danger" />;
      case 'pending': return <Clock className="text-warning animate-pulse" />;
    }
  };

  const formatType = (t: string) => t.replace('_', ' ').toUpperCase();

  return (
    <div className="bg-surface p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3 hover:border-gray-500 transition-colors">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-bg rounded-full border border-gray-700">
          {getSourceIcon()}
        </div>
        <div>
          <h3 className="font-bold text-lg">{formatType(event.eventType)}</h3>
          <p className="text-gray-400 text-sm">
            {new Date(event.occurredAt).toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        {event.confidence && (
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Confidence</p>
            <p className="font-mono text-accent">{(event.confidence * 100).toFixed(1)}%</p>
          </div>
        )}
        <div className="flex items-center gap-2 border-l border-gray-700 pl-6">
          {getStatusIcon()}
          <span className="capitalize font-medium">{event.deliveryStatus}</span>
        </div>
      </div>
    </div>
  );
};`,
  'src/components/AlertHistory.tsx': `import React from 'react';
import { AlertEvent } from '../types';
import { SoundEventCard } from './SoundEventCard';

export const AlertHistory: React.FC<{ alerts: AlertEvent[] }> = ({ alerts }) => {
  if (alerts.length === 0) {
    return (
      <div className="p-8 text-center bg-surface rounded-lg border border-gray-700 text-gray-400">
        No alerts have been recorded yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <SoundEventCard key={alert.id} event={alert} />
      ))}
    </div>
  );
};`,
  'src/pages/LandingPage.tsx': `import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Shield, Lock, Bell, Heart, Activity } from 'lucide-react';
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
import { AlertCircle } from 'lucide-react';`,
  'src/pages/LoginPage.tsx': `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded-xl border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Sign In</h1>
      </div>
      
      {error && (
        <div className="bg-danger/20 border border-danger text-red-200 p-4 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            required
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white p-4 rounded-lg text-xl font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      
      <p className="text-center mt-8 text-lg text-gray-400">
        Don't have an account? <Link to="/register" className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">Register here</Link>
      </p>
    </div>
  );
};`,
  'src/pages/RegisterPage.tsx': `import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await register({ name, email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 bg-surface p-8 rounded-xl border border-gray-700 shadow-2xl">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-accent mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Create Account</h1>
      </div>
      
      {error && (
        <div className="bg-danger/20 border border-danger text-red-200 p-4 rounded-lg mb-6" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            required
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            required
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-lg font-medium mb-2" htmlFor="password">Password (min 8 characters)</label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            className="w-full bg-bg border border-gray-600 rounded-lg p-4 text-lg focus:ring-2 focus:ring-accent focus:border-transparent outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-accent text-white p-4 rounded-lg text-xl font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      
      <p className="text-center mt-8 text-lg text-gray-400">
        Already have an account? <Link to="/login" className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent rounded px-1">Sign in</Link>
      </p>
    </div>
  );
};`,
  'src/pages/DashboardPage.tsx': `import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAlerts } from '../hooks/useAlerts';
import { useAudioMonitor } from '../hooks/useAudioMonitor';
import { MonitoringStatus } from '../components/MonitoringStatus';
import { AlertHistory } from '../components/AlertHistory';
import { Shield, ShieldOff, AlertTriangle, Send, Beaker, PlayCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import * as settingsApi from '../api/settings';
import { SoundEventType } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { alerts, sendAlert } = useAlerts();
  const [isTabHidden, setIsTabHidden] = useState(document.hidden);
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const handleDetection = (eventType: SoundEventType, confidence: number) => {
    sendAlert.mutate({
      eventType,
      source: 'sound',
      confidence,
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
    if (window.confirm('EMERGENCY: This will immediately email your trusted contact. Are you sure?')) {
      sendAlert.mutate({ eventType: 'manual', source: 'manual' });
    }
  };

  const handleTestAlert = () => {
    if (window.confirm('Send a test email to your contact?')) {
      sendAlert.mutate({ eventType: 'test', source: 'test' });
    }
  };

  const runDemoDetection = () => {
    setTimeout(() => {
      sendAlert.mutate({ eventType: 'smoke_alarm', source: 'sound', confidence: 0.99 });
    }, 3000);
  };

  return (
    <div className="space-y-8 pb-12">
      <MonitoringStatus 
        status={status} 
        message={statusMessage} 
        onStop={stopMonitoring} 
        isTabHidden={isTabHidden}
      />

      <section className="bg-surface p-6 md:p-8 rounded-xl border border-gray-700 shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-6 flex justify-center items-center gap-3">
          {status === 'active' ? (
            <><Shield className="text-success" size={40} /> Monitoring: ACTIVE</>
          ) : (
            <><ShieldOff className="text-gray-500" size={40} /> Monitoring: STOPPED</>
          )}
        </h2>
        
        {status === 'idle' || status === 'error' || status === 'unavailable' ? (
          <div>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              QuietGuard will ask for microphone access to listen for emergency sounds on your device. No audio is ever sent to our servers.
            </p>
            {status === 'unavailable' && (
              <div className="bg-warning/20 border border-warning text-yellow-200 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
                {statusMessage}
              </div>
            )}
            {status === 'error' && (
              <div className="bg-danger/20 border border-danger text-red-200 p-4 rounded-lg mb-6 max-w-2xl mx-auto">
                {statusMessage}
              </div>
            )}
            <button
              onClick={startMonitoring}
              disabled={status === 'unavailable' || !settings}
              className="w-full md:w-auto bg-success text-gray-900 px-8 py-5 rounded-lg text-2xl font-bold hover:bg-green-400 focus:ring-4 focus:ring-green-300 transition-colors disabled:opacity-50"
            >
              Start Monitoring
            </button>
          </div>
        ) : null}
      </section>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="text-danger" /> Emergency Controls
          </h3>
          <button
            onClick={handleManualAlert}
            disabled={sendAlert.isPending}
            className="w-full bg-danger text-white px-6 py-6 rounded-lg text-xl font-bold hover:bg-red-600 focus:ring-4 focus:ring-red-400 transition-colors mb-4 flex justify-center items-center gap-3"
          >
            <Send size={28} /> {sendAlert.isPending ? 'Sending...' : 'Send Emergency Alert'}
          </button>
          <button
            onClick={handleTestAlert}
            className="w-full bg-bg border border-gray-600 text-gray-200 px-6 py-4 rounded-lg text-lg font-bold hover:bg-gray-800 focus:ring-4 focus:ring-gray-500 transition-colors flex justify-center items-center gap-3"
          >
            <Beaker /> Send Test Email
          </button>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PlayCircle className="text-accent" /> Demo Mode
          </h3>
          <p className="text-gray-400 mb-6">
            Test the system without triggering actual sounds. This simulates a detection event after 3 seconds.
          </p>
          <button
            onClick={runDemoDetection}
            className="w-full bg-accent text-white px-6 py-4 rounded-lg text-lg font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 transition-colors"
          >
            Run Demo Detection [SIMULATED]
          </button>
        </div>
      </section>

      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">Recent Alerts</h3>
          <Link to="/alerts" className="text-accent hover:underline focus:ring-2 focus:ring-accent rounded px-2 py-1">View Full History &rarr;</Link>
        </div>
        <AlertHistory alerts={alerts.slice(0, 5)} />
      </section>
    </div>
  );
};`,
  'src/pages/SettingsPage.tsx': `import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as settingsApi from '../api/settings';
import * as contactsApi from '../api/contacts';
import { useAuth } from '../hooks/useAuth';
import { SoundEventType } from '../types';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saveMessage, setSaveMessage] = useState('');

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.getSettings,
  });

  const { data: contacts, isLoading: loadingContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getContacts,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      showSaveMessage('Settings saved successfully');
    },
  });

  const addContactMutation = useMutation({
    mutationFn: contactsApi.addContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showSaveMessage('Contact updated');
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: (data: { id: string; contact: any }) => contactsApi.updateContact(data.id, data.contact),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      showSaveMessage('Contact updated');
    },
  });

  const showSaveMessage = (msg: string) => {
    setSaveMessage(msg);
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const [localSettings, setLocalSettings] = useState(settings);
  const [localContact, setLocalContact] = useState({ name: '', email: '' });

  useEffect(() => {
    if (settings) setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (contacts && contacts.length > 0) {
      setLocalContact({ name: contacts[0].name, email: contacts[0].email });
    }
  }, [contacts]);

  if (loadingSettings || loadingContacts || !localSettings) {
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
    if (contacts && contacts.length > 0) {
      updateContactMutation.mutate({ id: contacts[0].id, contact: localContact });
    } else if (localContact.email) {
      addContactMutation.mutate(localContact);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

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

      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Trusted Contact</h2>
        <p className="text-gray-400 mb-6 text-lg">This is the person who will receive emergency alerts.</p>
        <div className="grid gap-4">
          <div>
            <label className="block text-lg mb-2" htmlFor="contactName">Contact Name</label>
            <input 
              id="contactName"
              type="text" 
              value={localContact.name} 
              onChange={e => setLocalContact({...localContact, name: e.target.value})}
              className="w-full bg-bg border border-gray-600 rounded-lg p-3 text-lg focus:ring-2 focus:ring-accent outline-none" 
            />
          </div>
          <div>
            <label className="block text-lg mb-2" htmlFor="contactEmail">Contact Email</label>
            <input 
              id="contactEmail"
              type="email" 
              value={localContact.email} 
              onChange={e => setLocalContact({...localContact, email: e.target.value})}
              className="w-full bg-bg border border-gray-600 rounded-lg p-3 text-lg focus:ring-2 focus:ring-accent outline-none" 
            />
          </div>
        </div>
      </section>

      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Sound Events Detection</h2>
        
        <div className="space-y-6">
          {['smoke_alarm', 'glass_break', 'distress', 'loud_impact'].map((event) => (
            <div key={event} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-gray-700 rounded-lg bg-bg">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id={\`enable-\${event}\`}
                  checked={localSettings.enabledEvents.includes(event as SoundEventType)}
                  onChange={() => handleToggleEvent(event as SoundEventType)}
                  className="w-6 h-6 rounded text-accent focus:ring-accent bg-gray-700 border-gray-600"
                />
                <label htmlFor={\`enable-\${event}\`} className="text-xl font-medium capitalize">
                  {event.replace('_', ' ')}
                </label>
              </div>
              
              <div className="flex items-center gap-4 flex-1 max-w-xs">
                <label className="text-sm text-gray-400">Sensitivity</label>
                <input 
                  type="range" 
                  min="0.1" max="0.9" step="0.1" 
                  disabled={!localSettings.enabledEvents.includes(event as SoundEventType)}
                  value={1.0 - (localSettings.thresholds[event as SoundEventType] || 0.5)} 
                  onChange={(e) => {
                    const threshold = 1.0 - parseFloat(e.target.value);
                    setLocalSettings({
                      ...localSettings,
                      thresholds: { ...localSettings.thresholds, [event]: threshold }
                    });
                  }}
                  className="w-full"
                />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-warning text-sm bg-warning/10 p-3 rounded border border-warning/30">
          ⚠️ Loud Impact detection is an experimental heuristic. It may detect any loud thud, not specifically falls.
        </p>
      </section>

      <section className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">Advanced Settings</h2>
        
        <div className="mb-6">
          <label className="block text-lg font-medium mb-2" htmlFor="cooldown">Alert Cooldown (seconds)</label>
          <p className="text-gray-400 mb-3">Minimum time between automated alerts to avoid duplicates.</p>
          <input 
            id="cooldown"
            type="number" 
            min="30" max="3600"
            value={localSettings.cooldownSeconds}
            onChange={e => setLocalSettings({...localSettings, cooldownSeconds: parseInt(e.target.value) || 30})}
            className="bg-bg border border-gray-600 rounded-lg p-3 text-lg w-full max-w-xs focus:ring-2 focus:ring-accent outline-none" 
          />
        </div>
        
        <div className="flex items-center gap-3 mt-8">
          <input 
            type="checkbox" 
            id="locationSharing"
            checked={localSettings.locationSharing}
            onChange={e => setLocalSettings({...localSettings, locationSharing: e.target.checked})}
            className="w-6 h-6 rounded text-accent focus:ring-accent bg-gray-700 border-gray-600"
          />
          <div>
            <label htmlFor="locationSharing" className="text-xl font-medium block">Enable Location Sharing</label>
            <p className="text-gray-400">If enabled, your approximate location will be included in alert emails.</p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-4 flex items-center justify-between bg-surface p-4 rounded-xl border border-gray-700 shadow-2xl">
        <span className="text-success font-bold text-lg">{saveMessage}</span>
        <button 
          onClick={handleSave}
          className="bg-accent text-white px-8 py-4 rounded-lg text-xl font-bold hover:bg-indigo-500 focus:ring-4 focus:ring-indigo-300 transition-colors"
        >
          Save All Changes
        </button>
      </div>
    </div>
  );
};`,
  'src/pages/AlertHistoryPage.tsx': `import React from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { AlertHistory } from '../components/AlertHistory';

export const AlertHistoryPage: React.FC = () => {
  const { alerts, isLoading } = useAlerts();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-3xl font-bold mb-8">Alert History</h1>
      
      {isLoading ? (
        <div className="p-8 text-center text-xl text-gray-400">Loading history...</div>
      ) : (
        <div className="bg-surface p-6 rounded-xl border border-gray-700 shadow-lg">
          <AlertHistory alerts={alerts} />
        </div>
      )}
    </div>
  );
};`,
  'src/App.tsx': `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { AlertHistoryPage } from './pages/AlertHistoryPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            
            <Route path="dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="alerts" element={
              <ProtectedRoute>
                <AlertHistoryPage />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;`
};

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

for (const [filePath, content] of Object.entries(files)) {
  const fullPath = path.join(projectRoot, filePath);
  ensureDirSync(path.dirname(fullPath));
  fs.writeFileSync(fullPath, content, 'utf8');
}
console.log('Setup complete.');
