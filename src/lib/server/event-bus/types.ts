/* eslint-disable @typescript-eslint/no-explicit-any */
export type EventEnvelope = {
  id: string;              // UUID
  channel: string;         // Channel name
  timestamp: string;       // ISO timestamp
  version: string;         // Schema version
  type: string;            // Event type
  data: Record<string, any>;
  userId?: string;         // Originating user
  entityId?: string;       // Related entity
  metadata?: Record<string, any>;
}

export type ChannelSubscription = {
  channel: string;
  filters?: Record<string, any>;
}

export type ConnectionInfo = {
  connectionId: string;
  userId: string;
  channels: Set<string>;
  connectedAt: Date;
  lastPingAt: Date;
}