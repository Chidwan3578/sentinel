export interface AccessIntent {
  summary: string;
  description: string;
  task_id: string;
}

export interface AccessRequest {
  agent_id: string;
  resource_id: string;
  intent: AccessIntent;
  ttl_seconds: number;
}

export interface SecretPayload {
  type: string;
  value: string;
  expires_at: string;
}

export type AccessStatus = 'APPROVED' | 'PENDING_APPROVAL' | 'DENIED';

export interface AccessResponse {
  request_id: string;
  status: AccessStatus;
  secret?: SecretPayload;
  message?: string;
  polling_url?: string;
  reason?: string;
}
