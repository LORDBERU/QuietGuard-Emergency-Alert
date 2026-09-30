import React from 'react';
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
};