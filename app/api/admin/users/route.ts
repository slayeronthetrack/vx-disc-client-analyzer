/**
 * Admin Users API Route
 * GET /api/admin/users - List all admin users (super_admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/users
 * List all users with admin or super_admin role
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is super_admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Forbidden - Super admin access required' },
        { status: 403 }
      );
    }

    // Get all admin users
    const { data: admins, error } = await supabase
      .from('profiles')
      .select(`
        user_id,
        role,
        created_at
      `)
      .in('role', ['admin', 'super_admin'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch admins: ${error.message}`);
    }

    // Get emails from auth.users
    const userIds = admins?.map(a => a.user_id) || [];
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    
    const adminsWithEmails = admins?.map(admin => {
      const authUser = authUsers?.users.find(u => u.id === admin.user_id);
      return {
        ...admin,
        email: authUser?.email || 'Unknown',
      };
    }) || [];

    return NextResponse.json({ admins: adminsWithEmails });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}
