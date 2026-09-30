import React from 'react';
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
};