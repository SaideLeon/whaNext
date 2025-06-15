export interface KeywordRule {
  id: string;
  keyword: string;
  reply: string;
  createdAt: Date;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error' | 'qr';
