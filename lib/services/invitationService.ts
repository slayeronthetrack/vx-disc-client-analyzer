/**
 * Invitation Service
 * Business logic for test invitations
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  TestInvitation,
  CreateInvitationInput,
  BulkInvitationInput,
  InvitationFilters,
  InvitationListResponse,
  InvitationStats,
} from '@/types/invitation';

/**
 * Create a single invitation
 */
export async function createInvitation(
  companyId: string,
  input: CreateInvitationInput,
  sentBy: string,
  supabase: SupabaseClient
): Promise<TestInvitation> {
  // Generate expiration date (default: 30 days)
  const expiresInDays = input.expires_in_days || 30;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  // Generate unique token
  const { data: tokenData, error: tokenError } = await supabase
    .rpc('generate_invitation_token');

  if (tokenError) {
    throw new Error(`Failed to generate token: ${tokenError.message}`);
  }

  const token = tokenData as string;

  // Create invitation
  const { data, error } = await supabase
    .from('test_invitations')
    .insert({
      company_id: companyId,
      employee_name: input.employee_name,
      employee_email: input.employee_email.toLowerCase().trim(),
      employee_position: input.employee_position || null,
      employee_department: input.employee_department || null,
      invitation_token: token,
      expires_at: expiresAt.toISOString(),
      sent_by: sentBy,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`);
  }

  return data;
}

/**
 * Create multiple invitations (bulk)
 */
export async function createBulkInvitations(
  companyId: string,
  input: BulkInvitationInput,
  sentBy: string,
  supabase: SupabaseClient
): Promise<TestInvitation[]> {
  const invitations: TestInvitation[] = [];

  for (const invitationInput of input.invitations) {
    try {
      const invitation = await createInvitation(
        companyId,
        invitationInput,
        sentBy,
        supabase
      );
      invitations.push(invitation);
    } catch (error) {
      console.error(`Failed to create invitation for ${invitationInput.employee_email}:`, error);
      // Continue with other invitations
    }
  }

  // Send emails if requested
  if (input.send_immediately) {
    await sendInvitations(
      invitations.map(inv => inv.id),
      supabase
    );
  }

  return invitations;
}

/**
 * Get invitation by token (public access)
 */
export async function getInvitationByToken(
  token: string,
  supabase: SupabaseClient
): Promise<TestInvitation | null> {
  const { data, error } = await supabase
    .from('test_invitations')
    .select('*')
    .eq('invitation_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch invitation: ${error.message}`);
  }

  // Check if expired
  if (new Date(data.expires_at) < new Date()) {
    // Update status to expired
    await supabase
      .from('test_invitations')
      .update({ status: 'expired' })
      .eq('id', data.id);

    return null;
  }

  return data;
}

/**
 * Get invitations for a company with filters
 */
export async function getCompanyInvitations(
  companyId: string,
  filters: InvitationFilters,
  supabase: SupabaseClient
): Promise<InvitationListResponse> {
  // Build query
  let query = supabase
    .from('test_invitations')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId);

  // Apply filters
  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(
      `employee_name.ilike.%${filters.search}%,employee_email.ilike.%${filters.search}%`
    );
  }

  if (filters.department) {
    query = query.eq('employee_department', filters.department);
  }

  // Apply sorting
  const sortBy = filters.sortBy || 'created_at';
  const sortOrder = filters.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: invitations, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch invitations: ${error.message}`);
  }

  // Get stats
  const stats = await getInvitationStats(companyId, supabase);

  return {
    invitations: invitations || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
    stats: {
      pending: stats.pending,
      sent: stats.sent,
      opened: stats.opened,
      started: stats.started,
      completed: stats.completed,
      expired: stats.expired,
    },
  };
}

/**
 * Get invitation statistics
 */
export async function getInvitationStats(
  companyId: string,
  supabase: SupabaseClient
): Promise<InvitationStats> {
  const { data, error } = await supabase
    .from('test_invitations')
    .select('status')
    .eq('company_id', companyId);

  if (error) {
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }

  const invitations = data || [];
  const total = invitations.length;

  const stats = {
    total,
    pending: invitations.filter(i => i.status === 'pending').length,
    sent: invitations.filter(i => i.status === 'sent').length,
    opened: invitations.filter(i => i.status === 'opened').length,
    started: invitations.filter(i => i.status === 'started').length,
    completed: invitations.filter(i => i.status === 'completed').length,
    expired: invitations.filter(i => i.status === 'expired').length,
    completionRate: 0,
    openRate: 0,
  };

  // Calculate rates
  const sentCount = stats.sent + stats.opened + stats.started + stats.completed;
  if (sentCount > 0) {
    stats.completionRate = Math.round((stats.completed / sentCount) * 100);
    stats.openRate = Math.round(((stats.opened + stats.started + stats.completed) / sentCount) * 100);
  }

  return stats;
}

/**
 * Send invitations (mark as sent and trigger email)
 */
export async function sendInvitations(
  invitationIds: string[],
  supabase: SupabaseClient
): Promise<void> {
  // Update status to 'sent'
  const { error } = await supabase
    .from('test_invitations')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .in('id', invitationIds);

  if (error) {
    throw new Error(`Failed to send invitations: ${error.message}`);
  }

  // TODO: Trigger email sending (implement with Resend, SendGrid, etc.)
  // For now, just log
  console.log(`[sendInvitations] Sent ${invitationIds.length} invitations`);
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(
  invitationId: string,
  status: string,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from('test_invitations')
    .update({ status })
    .eq('id', invitationId);

  if (error) {
    throw new Error(`Failed to update invitation status: ${error.message}`);
  }
}

/**
 * Delete invitation
 */
export async function deleteInvitation(
  invitationId: string,
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase
    .from('test_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) {
    throw new Error(`Failed to delete invitation: ${error.message}`);
  }
}

/**
 * Resend invitation (send reminder)
 */
export async function resendInvitation(
  invitationId: string,
  supabase: SupabaseClient
): Promise<void> {
  // Get current invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('test_invitations')
    .select('reminder_count')
    .eq('id', invitationId)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch invitation: ${fetchError.message}`);
  }

  // Update reminder count and timestamp
  const { error } = await supabase
    .from('test_invitations')
    .update({
      reminder_count: (invitation.reminder_count || 0) + 1,
      last_reminder_at: new Date().toISOString(),
    })
    .eq('id', invitationId);

  if (error) {
    throw new Error(`Failed to resend invitation: ${error.message}`);
  }

  // TODO: Trigger reminder email
  console.log(`[resendInvitation] Sent reminder for invitation ${invitationId}`);
}
