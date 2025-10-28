export interface ActiveUser {
  sub: string;
  email: string;
  businessId: string | null;
  sessionId?: string;
  jti: string;
  accessJti?: string;
}
