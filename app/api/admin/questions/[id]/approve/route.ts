/**
 * API Route: Approve Flagged Question
 * Changes status to 'active' and increases quality_score to 60
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

    // Get current question
    const { data: question, error: fetchError } = await supabase
      .from('question_bank')
      .select('*')
      .eq('id', questionId)
      .single();

    if (fetchError || !question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Update question: set status to 'active' and quality_score to 60
    const { data: updated, error: updateError } = await supabase
      .from('question_bank')
      .update({
        status: 'active',
        quality_score: Math.max(question.quality_score, 60), // Ensure at least 60
        last_updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      message: 'Question approved successfully',
      question: updated,
    });
  } catch (error) {
    console.error('Error approving question:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
