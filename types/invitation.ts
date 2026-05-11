/**
 * Test Invitation Types
 */

export type InvitationStatus = 
  | 'pending'    // Created but not sent yet
  | 'sent'       // Email sent
  | 'opened'     // Recipient opened the link
  | 'started'    // Recipient started the test
  | 'completed'  // Test completed
  | 'expired';   // Invitation expired

export interface TestInvitation {
  id: string;
  company_id: string;
  
  // Employee info
  employee_name: string;
  employee_email: string;
  employee_position: string | null;
  employee_department: string | null;
  
  // Invitation details
  invitation_token: string;
  status: InvitationStatus;
  
  // Tracking
  sent_at: string | null;
  opened_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string;
  
  // Related test
  test_id: string | null;
  
  // Metadata
  sent_by: string | null;
  reminder_count: number;
  last_reminder_at: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface CreateInvitationInput {
  employee_name: string;
  employee_email: string;
  employee_position?: string;
  employee_department?: string;
  expires_in_days?: number; // Default: 30 days
}

export interface BulkInvitationInput {
  invitations: CreateInvitationInput[];
  send_immediately?: boolean;
}

export interface InvitationFilters {
  status?: InvitationStatus | 'all';
  search?: string; // Search by name or email
  department?: string;
  sortBy?: 'created_at' | 'sent_at' | 'employee_name' | 'status';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface InvitationListResponse {
  invitations: TestInvitation[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: {
    pending: number;
    sent: number;
    opened: number;
    started: number;
    completed: number;
    expired: number;
  };
}

export interface InvitationStats {
  total: number;
  pending: number;
  sent: number;
  opened: number;
  started: number;
  completed: number;
  expired: number;
  completionRate: number;
  openRate: number;
}
