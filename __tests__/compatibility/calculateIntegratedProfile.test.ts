/**
 * Calculate Integrated Profile Compatibility Tests
 * Testa cálculo de perfil com perguntas do banco
 */

import {
  calculateIntegratedProfile,
  calculateDISCScores,
  calculateValueScores,
  calculatePsychologicalProfile,
  convertLegacyAnswers,
} from '@/utils/calculateIntegratedProfile';
import type { ExtendedAnswer } from '@/types/integrated-profile';

describe('Calculate Integrated Profile Compatibility', () => {
  describe('DISC-only Calculation', () => {
    it('should calculate DISC profile from DISC-only questions', () => {
      const answers: ExtendedAnswer[] = [
        {
          questionId: 1,
          selectedOptions: [{ type: 'D' }],
        },
        {
          questionId: 2,
          selectedOptions: [{ type: 'D' }],
        },
        {
          questionId: 3,
          selectedOptions: [{ type: 'I' }],
        },
        {
          questionId: 4,
          selectedOptions: [{ type: 'S' }],
        },
        {
          questionId: 5,
          selectedOptions: [{ type: 'C' }],
        },
      ];

      const result = calculateIntegratedProfile(answers);
      
      expect(result.disc).toBeDefined();
      expect(result.disc.dominant).toBe('D');
      expect(result.disc.scores.D).toBe(2);
      expect(result.disc.scores.I).toBe(1);
      expect(result.disc.scores.S).toBe(1);
      expect(result.disc.scores.C).toBe(1);
      expect(result.values).toBeUndefined();
      expect(result.psychological).toBeUndefined();
    });

    it('should calculate percentages correctly', () => {
      const answers: ExtendedAnswer[] = [
        { questionId: 1, selectedOptions: [{ type: 'D' }] },
        { questionId: 2, selectedOptions: [{ type: 'D' }] },
        { questionId: 3, selectedOptions: [{ type: 'D' }] },
        { questionId: 4, selectedOptions: [{ type: 'I' }] },
      ];

      const result = calculateDISCScores(answers);
      
      expect(result.percentages.D).toBe(75); // 3/4 = 75%
      expect(result.percentages.I).toBe(25); // 1/4 = 25%
      expect(result.percentages.S).toBe(0);
      expect(result.percentages.C).toBe(0);
    });
  });

  describe('Integrated Profile Calculation', () => {
    it('should calculate DISC + Values profile', () => {
      const answers: ExtendedAnswer[] = [
        {
          questionId: 1,
          selectedOptions: [{ type: 'D', valueType: 'economic' }],
        },
        {
          questionId: 2,
          selectedOptions: [{ type: 'I', valueType: 'social' }],
        },
        {
          questionId: 3,
          selectedOptions: [{ type: 'S', valueType: 'aesthetic' }],
        },
        {
          questionId: 4,
          selectedOptions: [{ type: 'C', valueType: 'theoretical' }],
        },
      ];

      const result = calculateIntegratedProfile(answers);
      
      expect(result.disc).toBeDefined();
      expect(result.values).toBeDefined();
      expect(result.values?.dominant).toBeDefined();
      expect(result.metadata.hasValues).toBe(true);
    });

    it('should calculate DISC + Psychological profile', () => {
      const answers: ExtendedAnswer[] = [
        {
          questionId: 1,
          selectedOptions: [{
            type: 'D',
            psychTraits: { energy: 'extrovert', decision: 'rational' },
          }],
        },
        {
          questionId: 2,
          selectedOptions: [{
            type: 'I',
            psychTraits: { energy: 'extrovert', decision: 'emotional' },
          }],
        },
        {
          questionId: 3,
          selectedOptions: [{
            type: 'S',
            psychTraits: { energy: 'introvert', perception: 'sensory' },
          }],
        },
        {
          questionId: 4,
          selectedOptions: [{
            type: 'C',
            psychTraits: { energy: 'introvert', organization: 'structured' },
          }],
        },
      ];

      const result = calculateIntegratedProfile(answers);
      
      expect(result.disc).toBeDefined();
      expect(result.psychological).toBeDefined();
      expect(result.psychological?.energy).toBeDefined();
      expect(result.metadata.hasPsychological).toBe(true);
    });

    it('should calculate full integrated profile', () => {
      const answers: ExtendedAnswer[] = [
        {
          questionId: 1,
          selectedOptions: [{
            type: 'D',
            valueType: 'economic',
            psychTraits: { energy: 'extrovert', decision: 'rational' },
          }],
        },
        {
          questionId: 2,
          selectedOptions: [{
            type: 'I',
            valueType: 'social',
            psychTraits: { energy: 'extrovert', decision: 'emotional' },
          }],
        },
      ];

      const result = calculateIntegratedProfile(answers);
      
      expect(result.disc).toBeDefined();
      expect(result.values).toBeDefined();
      expect(result.psychological).toBeDefined();
      expect(result.metadata.hasValues).toBe(true);
      expect(result.metadata.hasPsychological).toBe(true);
    });
  });

  describe('Value Scores Calculation', () => {
    it('should calculate value scores correctly', () => {
      const answers: ExtendedAnswer[] = [
        { questionId: 1, selectedOptions: [{ type: 'D', valueType: 'economic' }] },
        { questionId: 2, selectedOptions: [{ type: 'I', valueType: 'economic' }] },
        { questionId: 3, selectedOptions: [{ type: 'S', valueType: 'social' }] },
        { questionId: 4, selectedOptions: [{ type: 'C', valueType: 'theoretical' }] },
      ];

      const values = calculateValueScores(answers);
      
      expect(values).toBeDefined();
      expect(values?.dominant).toBe('economic');
      expect(values?.scores.economic).toBe(2);
      expect(values?.scores.social).toBe(1);
      expect(values?.scores.theoretical).toBe(1);
    });

    it('should return null when no value data', () => {
      const answers: ExtendedAnswer[] = [
        { questionId: 1, selectedOptions: [{ type: 'D' }] },
        { questionId: 2, selectedOptions: [{ type: 'I' }] },
      ];

      const values = calculateValueScores(answers);
      
      expect(values).toBeNull();
    });

    it('should identify secondary values', () => {
      const answers: ExtendedAnswer[] = [
        { questionId: 1, selectedOptions: [{ type: 'D', valueType: 'economic' }] },
        { questionId: 2, selectedOptions: [{ type: 'I', valueType: 'economic' }] },
        { questionId: 3, selectedOptions: [{ type: 'S', valueType: 'economic' }] },
        { questionId: 4, selectedOptions: [{ type: 'C', valueType: 'social' }] },
        { questionId: 5, selectedOptions: [{ type: 'D', valueType: 'social' }] },
        { questionId: 6, selectedOptions: [{ type: 'I', valueType: 'theoretical' }] },
      ];

      const values = calculateValueScores(answers);
      
      expect(values?.dominant).toBe('economic');
      expect(values?.secondary).toContain('social');
      expect(values?.secondary.length).toBeGreaterThan(0);
    });
  });

  describe('Psychological Profile Calculation', () => {
    it('should calculate psychological profile correctly', () => {
      const answers: ExtendedAnswer[] = [
        {
          questionId: 1,
          selectedOptions: [{
            type: 'D',
            psychTraits: { energy: 'extrovert', decision: 'rational' },
          }],
        },
        {
          questionId: 2,
          selectedOptions: [{
            type: 'I',
            psychTraits: { energy: 'extrovert', perception: 'intuitive' },
          }],
        },
        {
          questionId: 3,
          selectedOptions: [{
            type: 'S',
            psychTraits: { organization: 'structured' },
          }],
        },
      ];

      const psych = calculatePsychologicalProfile(answers);
      
      expect(psych).toBeDefined();
      expect(psych?.energy).toBe('extrovert');
      expect(psych?.code).toBeDefined();
    });

    it('should return null when no psychological data', () => {
      const answers: ExtendedAnswer[] = [
        { questionId: 1, selectedOptions: [{ type: 'D' }] },
        { questionId: 2, selectedOptions: [{ type: 'I' }] },
      ];

      const psych = calculatePsychologicalProfile(answers);
      
      expect(psych).toBeNull();
    });

    it('should generate correct MBTI-like code', () => {
      const answers: ExtendedAnswer[] = [
        {
          questionId: 1,
          selectedOptions: [{
            type: 'D',
            psychTraits: {
              energy: 'extrovert',
              perception: 'intuitive',
              decision: 'rational',
              organization: 'structured',
            },
          }],
        },
      ];

      const psych = calculatePsychologicalProfile(answers);
      
      expect(psych?.code).toBe('ENTJ-like');
    });
  });

  describe('Legacy Conversion', () => {
    it('should convert legacy answers to new format', () => {
      const legacyAnswers = [
        { questionId: 1, discTypes: ['D' as const] },
        { questionId: 2, discTypes: ['I' as const, 'S' as const] },
        { questionId: 3, discTypes: ['C' as const] },
      ];

      const converted = convertLegacyAnswers(legacyAnswers);
      
      expect(converted).toHaveLength(3);
      expect(converted[0].selectedOptions).toHaveLength(1);
      expect(converted[0].selectedOptions[0].type).toBe('D');
      expect(converted[1].selectedOptions).toHaveLength(2);
    });

    it('should work with calculateIntegratedProfile', () => {
      const legacyAnswers = [
        { questionId: 1, discTypes: ['D' as const] },
        { questionId: 2, discTypes: ['D' as const] },
        { questionId: 3, discTypes: ['I' as const] },
      ];

      const converted = convertLegacyAnswers(legacyAnswers);
      const result = calculateIntegratedProfile(converted);
      
      expect(result.disc.dominant).toBe('D');
      expect(result.values).toBeUndefined();
      expect(result.psychological).toBeUndefined();
    });
  });

  describe('Metadata', () => {
    it('should include correct metadata', () => {
      const answers: ExtendedAnswer[] = [
        { questionId: 1, selectedOptions: [{ type: 'D', valueType: 'economic' }] },
        { questionId: 2, selectedOptions: [{ type: 'I', valueType: 'social' }] },
      ];

      const result = calculateIntegratedProfile(answers);
      
      expect(result.metadata.questionCount).toBe(2);
      expect(result.metadata.hasValues).toBe(true);
      expect(result.metadata.hasPsychological).toBe(false);
      expect(result.metadata.calculatedAt).toBeDefined();
    });
  });
});
