import { OrganizationRole } from "./member";

export type InviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface OrganizationInvite {
  id: number;
  organization_id: number;
  email: string;
  role: OrganizationRole;
  token: string;
  status: InviteStatus;
  created_at: string;
  expires_at: string;
  accepted_at?: string;
}

export interface OrganizationInviteListResponse {
  data: OrganizationInvite[];
  total: number;
}
