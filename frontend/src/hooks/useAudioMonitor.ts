import { useState, useRef, useEffect, useCallback } from 'react';
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
}