/**
 * Question Validator
 * Validates AI-generated questions for structure, compliance, and duplication
 */

import { antiDuplicationSystem } from './antiDuplicationSystem';
import type {
  QuestionBankEntry,
  QuestionValidationResult,
  ValidationError,
  ValidationWarning,
  DuplicationCheckResult,
  IQuestionValidator,
} from '@/types/question-bank';
import type { DISCType } from '@/types/database';

class QuestionValidatorClass implements IQuestionValidator {
  // Clinical terms that should not appear in questions
  private readonly CLINICAL_TERMS = [
    'diagnóstico',
    'terapia',
    'transtorno',
    'doença',
    'patologia',
    'sintoma',
    'tratamento',
    'clínico',
    'psicopatologia',
    'disorder',
    'therapy',
    'diagnosis',
    'disease',
    'pathology',
    'symptom',
    'treatment',
    'clinical',
  ];

  /**
   * Validate a question comprehensively
   * Checks structure, compliance, and duplication
   */
  async validate(question: QuestionBankEntry): Promise<QuestionValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check structure
    const structureErrors = this.checkStructure(question);
    errors.push(...structureErrors);

    // Check compliance (clinical terms)
    const complianceErrors = this.checkCompliance(question);
    errors.push(...complianceErrors);

    // Check duplication (async)
    const duplicationResult = await this.checkDuplication(question);
    if (duplicationResult.is_duplicate) {
      errors.push({
        type: 'duplication',
        message: `Question is a duplicate (similarity: ${duplicationResult.similarity_score.toFixed(2)})`,
        field: 'question_text',
      });
    } else if (duplicationResult.similarity_score >= 0.70) {
      warnings.push({
        type: 'quality',
        message: `Question may be similar to existing question (similarity: ${duplicationResult.similarity_score.toFixed(2)})`,
        field: 'question_text',
      });
    }

    // Check metadata completeness
    const metadataWarnings = this.checkMetadata(question);
    warnings.push(...metadataWarnings);

    const valid = errors.length === 0;

    return {
      valid,
      errors,
      warnings,
      question: valid ? question : null,
    };
  }

  /**
   * Check question structure
   * Validates: 4 options, unique DISC types, required fields
   */
  checkStructure(question: QuestionBankEntry): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check question text
    if (!question.question_text || question.question_text.trim().length < 10) {
      errors.push({
        type: 'structure',
        message: 'Question text must be at least 10 characters',
        field: 'question_text',
      });
    }

    // Check options array
    if (!question.options || !Array.isArray(question.options)) {
      errors.push({
        type: 'structure',
        message: 'Options must be an array',
        field: 'options',
      });
      return errors; // Can't continue validation without options
    }

    // Check exactly 4 options
    if (question.options.length !== 4) {
      errors.push({
        type: 'structure',
        message: `Question must have exactly 4 options (found ${question.options.length})`,
        field: 'options',
      });
    }

    // Check each option has required fields
    question.options.forEach((option, index) => {
      if (!option.text || option.text.trim().length === 0) {
        errors.push({
          type: 'structure',
          message: `Option ${index + 1} must have text`,
          field: `options[${index}].text`,
        });
      }

      if (!option.type || !['D', 'I', 'S', 'C'].includes(option.type)) {
        errors.push({
          type: 'structure',
          message: `Option ${index + 1} must have a valid DISC type (D, I, S, or C)`,
          field: `options[${index}].type`,
        });
      }
    });

    // Check unique DISC types
    const discTypes = question.options.map((opt) => opt.type);
    const uniqueTypes = new Set(discTypes);
    if (uniqueTypes.size !== 4) {
      errors.push({
        type: 'structure',
        message: 'Each option must have a unique DISC type (D, I, S, C)',
        field: 'options',
      });
    }

    // Check all DISC types are present
    const requiredTypes: DISCType[] = ['D', 'I', 'S', 'C'];
    const missingTypes = requiredTypes.filter((type) => !uniqueTypes.has(type));
    if (missingTypes.length > 0) {
      errors.push({
        type: 'structure',
        message: `Missing DISC types: ${missingTypes.join(', ')}`,
        field: 'options',
      });
    }

    return errors;
  }

  /**
   * Check compliance with business rules
   * Validates: no clinical terms, professional language
   */
  checkCompliance(question: QuestionBankEntry): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check for clinical terms in question text
    const questionLower = question.question_text.toLowerCase();
    const foundClinicalTerms = this.CLINICAL_TERMS.filter((term) =>
      questionLower.includes(term.toLowerCase())
    );

    if (foundClinicalTerms.length > 0) {
      errors.push({
        type: 'compliance',
        message: `Question contains clinical terms: ${foundClinicalTerms.join(', ')}`,
        field: 'question_text',
      });
    }

    // Check for clinical terms in options
    question.options?.forEach((option, index) => {
      const optionLower = option.text.toLowerCase();
      const foundTerms = this.CLINICAL_TERMS.filter((term) =>
        optionLower.includes(term.toLowerCase())
      );

      if (foundTerms.length > 0) {
        errors.push({
          type: 'compliance',
          message: `Option ${index + 1} contains clinical terms: ${foundTerms.join(', ')}`,
          field: `options[${index}].text`,
        });
      }
    });

    // Check for inappropriate language (basic check)
    const inappropriatePatterns = [
      /\b(idiota|burro|estúpido|imbecil)\b/i,
      /\b(stupid|idiot|dumb|moron)\b/i,
    ];

    inappropriatePatterns.forEach((pattern) => {
      if (pattern.test(question.question_text)) {
        errors.push({
          type: 'compliance',
          message: 'Question contains inappropriate language',
          field: 'question_text',
        });
      }

      question.options?.forEach((option, index) => {
        if (pattern.test(option.text)) {
          errors.push({
            type: 'compliance',
            message: `Option ${index + 1} contains inappropriate language`,
            field: `options[${index}].text`,
          });
        }
      });
    });

    return errors;
  }

  /**
   * Check for duplication using anti-duplication system
   */
  async checkDuplication(question: QuestionBankEntry): Promise<DuplicationCheckResult> {
    try {
      return await antiDuplicationSystem.isDuplicate(question.question_text, 0.85);
    } catch (error) {
      console.error('Error checking duplication:', error);
      // Return non-duplicate result if check fails
      return {
        is_duplicate: false,
        similarity_score: 0,
        similar_question_id: null,
        similar_question_text: null,
        threshold_used: 0.85,
      };
    }
  }

  /**
   * Check metadata completeness
   * Returns warnings for missing optional metadata
   */
  private checkMetadata(question: QuestionBankEntry): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check if context tags are empty
    if (
      (!question.context_tags || question.context_tags.length === 0) &&
      (!question.profession_tags || question.profession_tags.length === 0) &&
      (!question.seniority_tags || question.seniority_tags.length === 0) &&
      (!question.objective_tags || question.objective_tags.length === 0)
    ) {
      warnings.push({
        type: 'metadata',
        message: 'Question has no context tags. Consider adding tags for better matching.',
        field: 'context_tags',
      });
    }

    // Check if value_types are present for integrated profile
    if (!question.value_types || question.value_types.length === 0) {
      warnings.push({
        type: 'metadata',
        message: 'Question has no value types. This is a DISC-only question.',
        field: 'value_types',
      });
    }

    // Check if psychological_traits are present
    if (
      !question.psychological_traits ||
      Object.keys(question.psychological_traits).length === 0
    ) {
      warnings.push({
        type: 'metadata',
        message: 'Question has no psychological traits coverage.',
        field: 'psychological_traits',
      });
    }

    return warnings;
  }

  /**
   * Validate a batch of questions
   * More efficient than validating one at a time
   */
  async validateBatch(
    questions: QuestionBankEntry[]
  ): Promise<QuestionValidationResult[]> {
    const results = await Promise.all(questions.map((q) => this.validate(q)));
    return results;
  }

  /**
   * Get validation summary for a batch
   */
  getValidationSummary(results: QuestionValidationResult[]): {
    total: number;
    valid: number;
    invalid: number;
    withWarnings: number;
    errorTypes: Record<string, number>;
  } {
    const summary = {
      total: results.length,
      valid: results.filter((r) => r.valid).length,
      invalid: results.filter((r) => !r.valid).length,
      withWarnings: results.filter((r) => r.warnings.length > 0).length,
      errorTypes: {} as Record<string, number>,
    };

    // Count error types
    results.forEach((result) => {
      result.errors.forEach((error) => {
        summary.errorTypes[error.type] = (summary.errorTypes[error.type] || 0) + 1;
      });
    });

    return summary;
  }
}

// Export singleton instance
export const questionValidator = new QuestionValidatorClass();
