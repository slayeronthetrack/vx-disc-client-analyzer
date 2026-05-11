/**
 * Manage Admin Access API Route
 * POST /api/admin/users/manage - Grant or revoke admin access (super_admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * POST /api/admin/users/manage
 * Grant or revoke admin role for a user by email
 */
export async function POST(request: NextRequest) {
  try {
    // Use service role to bypass RLS and access auth.users
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if requester is authenticated and super_admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if requester is super_admin
    const { data: requesterProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!requesterProfile || requesterProfile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email, action } = body;

    if (!email || !action) {
      return NextResponse.json(
        { error: 'Email and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'grant' && action !== 'revoke') {
      return NextResponse.json(
        { error: 'Action must be "grant" or "revoke"' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const targetUser = authUsers?.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Prevent removing super_admin from self
    if (action === 'revoke' && targetUser.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot remove your own admin access' },
        { status: 400 }
      );
    }

    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', targetUser.id)
      .single();

    const newRole = action === 'grant' ? 'admin' : 'user';

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('user_id', targetUser.id);

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`);
      }
    } else {
      // Create new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: targetUser.id,
          role: newRole,
        });

      if (insertError) {
        throw new Error(`Failed to create profile: ${insertError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: action === 'grant' 
        ? `Admin access granted to ${email}` 
        : `Admin access revoked from ${email}`,
      user: {
        email: targetUser.email,
        role: newRole,
      },
    });
  } catch (error) {
    console.error('Error managing admin access:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to manage admin access' },
      { status: 500 }
    );
  }
}
