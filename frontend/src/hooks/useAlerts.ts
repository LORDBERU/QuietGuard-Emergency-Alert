import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as alertsApi from '../api/alerts';

export function useAlerts() {
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['alerts'],
    queryFn: alertsApi.getAlerts,
  });

  const sendManualAlert = useMutation({
    mutationFn: alertsApi.sendManualAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const sendSoundAlert = useMutation({
    mutationFn: alertsApi.sendSoundAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  const sendTestAlert = useMutation({
    mutationFn: alertsApi.sendTestAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    },
  });

  return { alerts, isLoading, sendManualAlert, sendSoundAlert, sendTestAlert };
}