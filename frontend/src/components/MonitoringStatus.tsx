import React from 'react';
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
};