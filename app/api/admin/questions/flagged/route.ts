/**
 * API Route: Get Flagged Questions
 * Returns questions with status='flagged' for admin review
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Get flagged questions
    const { data: questions, error: questionsError } = await supabase
      .from('question_bank')
      .select('*')
      .eq('status', 'flagged')
      .order('quality_score', { ascending: true }); // Lowest quality first

    if (questionsError) {
      throw questionsError;
    }

    return NextResponse.json({
      questions: questions || [],
      count: questions?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching flagged questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
