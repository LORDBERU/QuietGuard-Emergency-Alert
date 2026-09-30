import React from 'react';
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
};