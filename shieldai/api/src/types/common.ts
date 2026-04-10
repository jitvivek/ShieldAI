/**
 * Shared / common types used throughout the ShieldAI API.
 */

export interface ApiError {
  error: {
    code: string;
    message: string;
    retry_after?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    ml_service: 'connected' | 'disconnected';
  };
}

export interface ApiKeyInfo {
  id: string;
  keyPrefix: string;
  name: string;
  tier: string;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse {
  key: string; // Full key — shown only once
  id: string;
  keyPrefix: string;
  name: string;
  tier: string;
}

/** Extends Express Request with authenticated user context */
export interface AuthenticatedRequest {
  apiKeyId: string;
  customerId: string;
  tier: string;
}
