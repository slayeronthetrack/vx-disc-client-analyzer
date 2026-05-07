/**
 * API Route: Archive Question
 * Changes status to 'archived' and removes from active selection
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id: questionId } = await params;

    // Get request body for reason
    const body = await request.json();
    const reason = body.reason || 'Archived by admin';

    // Get current question
    const { data: question, error: fetchError } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Update question: set status to 'archived'
    const { data: updated, error: updateError } = await supabase
      .from('question_bank')
      .update({
        status: 'archived',
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Log the archival
    console.log(`Question ${questionId} archived by ${user.email}: ${reason}`);

    return NextResponse.json({
      message: 'Question archived successfully',
      question: updated,
      reason,
    });
  } catch (error) {
    console.error('Error archiving question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
