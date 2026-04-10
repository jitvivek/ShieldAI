import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.getStats(),
    refetchInterval: 30_000,
  });
}

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => api.getHealth(),
    refetchInterval: 60_000,
  });
}

export function useLogs(params: { page?: number; verdict?: string }) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: () => api.getLogs({ ...params, per_page: 50 }),
  });
}

export function useApiKeys() {
  return useQuery({
    queryKey: ['api-keys'],
    queryFn: () => api.getApiKeys(),
  });
}

export function useDetect() {
  return useMutation({
    mutationFn: (input: string) => api.detect(input),
  });
}

export function useCreateApiKey() {
  return useMutation({
    mutationFn: (data: { name?: string; customer_email: string; tier?: string }) =>
      api.createApiKey(data),
  });
}

export function useRevokeApiKey() {
  return useMutation({
    mutationFn: (id: string) => api.revokeApiKey(id),
  });
}
