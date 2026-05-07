/**
 * Update Question Scores
 * Daily job to update quality_scores based on performance metrics
 * 
 * Run with: npx tsx lib/scripts/updateQuestionScores.ts
 */

import { createClient } from '../supabase/server';
import { performanceTracker } from '../services/performanceTracker';
import { qualityScoreCalculator } from '../services/qualityScoreCalculator';
import type { QuestionBankEntry } from '@/types/question-bank';

interface ScoreUpdate {
  questionId: string;
  oldScore: number;
  newScore: number;
  reason: string;
}

async function updateQuestionScores() {
  console.log('[UpdateScores] Starting daily quality score update...');

  try {
    const supabaseClient = await createClient();

    // Get all active questions
    const { data: questions, error } = await supabaseClient
      .from('question_bank')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;

    if (!questions || questions.length === 0) {
      console.log('[UpdateScores] No active questions found');
      return;
    }

    console.log(`[UpdateScores] Processing ${questions.length} questions...`);

    const updates: ScoreUpdate[] = [];

    for (const question of questions as QuestionBankEntry[]) {
      try {
        // Get performance metrics
        const metrics = await performanceTracker.getMetrics(question.id);

        // Skip if no usage data
        if (metrics.usage_count === 0) {
          continue;
        }

        let newScore = question.quality_score;
        const reasons: string[] = [];

        // Rule 1: Low completion rate (-10 points)
        if (metrics.completion_rate < 80) {
          newScore -= 10;
          reasons.push(`Low completion rate: ${metrics.completion_rate}%`);
        }

        // Rule 2: High user feedback (+5 points)
        if (metrics.avg_user_feedback > 4.0) {
          newScore += 5;
          reasons.push(`High feedback: ${metrics.avg_user_feedback}/5`);
        }

        // Rule 3: Low user feedback (-5 points)
        if (metrics.avg_user_feedback > 0 && metrics.avg_user_feedback < 2.5) {
          newScore -= 5;
          reasons.push(`Low feedback: ${metrics.avg_user_feedback}/5`);
        }

        // Rule 4: High discrimination power (+10 points)
        if (metrics.discrimination_power > 0.7) {
          newScore += 10;
          reasons.push(`High discrimination: ${metrics.discrimination_power}`);
        }

        // Rule 5: Low discrimination power (-10 points)
        if (metrics.discrimination_power < 0.3) {
          newScore -= 10;
          reasons.push(`Low discrimination: ${metrics.discrimination_power}`);
        }

        // Clamp score between 0 and 100
        newScore = Math.max(0, Math.min(100, newScore));

        // Only update if score changed
        if (newScore !== question.quality_score) {
          // Determine new status based on thresholds
          const thresholds = qualityScoreCalculator.getThresholds();
          let newStatus = question.status;

          if (newScore < thresholds.archived) {
            newStatus = 'archived';
          } else if (newScore < thresholds.flagged) {
            newStatus = 'flagged';
          } else if (newScore >= thresholds.min_active) {
            newStatus = 'active';
          }

          // Update in database
          const { error: updateError } = await supabaseClient
            .from('question_bank')
            .update({
              quality_score: newScore,
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', question.id);

          if (updateError) {
            console.error(`[UpdateScores] Error updating question ${question.id}:`, updateError);
            continue;
          }

          updates.push({
            questionId: question.id,
            oldScore: question.quality_score,
            newScore,
            reason: reasons.join(', '),
          });

          console.log(
            `[UpdateScores] Updated ${question.id}: ${question.quality_score} → ${newScore} (${newStatus})`
          );
        }
      } catch (error) {
        console.error(`[UpdateScores] Error processing question ${question.id}:`, error);
        // Continue with other questions
      }
    }

    // Summary
    console.log('\n[UpdateScores] Summary:');
    console.log(`- Total questions processed: ${questions.length}`);
    console.log(`- Questions updated: ${updates.length}`);

    if (updates.length > 0) {
      console.log('\nUpdates:');
      for (const update of updates) {
        console.log(
          `  ${update.questionId}: ${update.oldScore} → ${update.newScore} (${update.reason})`
        );
      }
    }

    console.log('\n[UpdateScores] Daily update completed successfully');
  } catch (error) {
    console.error('[UpdateScores] Fatal error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  updateQuestionScores()
    .then(() => {
      console.log('[UpdateScores] Script finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('[UpdateScores] Script failed:', error);
      process.exit(1);
    });
}

export { updateQuestionScores };
