/**
 * Context Engine
 * Extracts and matches user context for intelligent question selection
 */

import type {
  ExtractedContext,
  UserContext,
  QuestionBankEntry,
  ProfessionTag,
  SeniorityTag,
  ObjectiveTag,
  IndustryTag,
  IContextEngine,
} from '@/types/question-bank';

class ContextEngineClass implements IContextEngine {
  /**
   * Extract context from user profile
   * Analyzes job_title, company, and test_objective to determine tags
   */
  extractContext(userProfile: {
    job_title?: string;
    company?: string;
    test_objective?: string;
  }): ExtractedContext {
    const context: ExtractedContext = {
      profession: null,
      seniority: null,
      objective: null,
      industry: null,
      confidence: 0,
    };

    let matchCount = 0;
    let totalChecks = 0;

    // Extract profession from job_title
    if (userProfile.job_title) {
      context.profession = this.extractProfession(userProfile.job_title);
      totalChecks++;
      if (context.profession) matchCount++;
    }

    // Extract seniority from job_title
    if (userProfile.job_title) {
      context.seniority = this.extractSeniority(userProfile.job_title);
      totalChecks++;
      if (context.seniority) matchCount++;
    }

    // Extract objective from test_objective
    if (userProfile.test_objective) {
      context.objective = this.extractObjective(userProfile.test_objective);
      totalChecks++;
      if (context.objective) matchCount++;
    }

    // Extract industry from company or job_title
    if (userProfile.company || userProfile.job_title) {
      context.industry = this.extractIndustry(
        userProfile.company || userProfile.job_title || ''
      );
      totalChecks++;
      if (context.industry) matchCount++;
    }

    // Calculate confidence (0-1)
    context.confidence = totalChecks > 0 ? matchCount / totalChecks : 0;

    return context;
  }

  /**
   * Extract profession from job title
   */
  private extractProfession(jobTitle: string): ProfessionTag | null {
    const lower = jobTitle.toLowerCase();

    // Sales
    if (
      lower.includes('sales') ||
      lower.includes('vendas') ||
      lower.includes('comercial') ||
      lower.includes('account') ||
      lower.includes('business development')
    ) {
      return 'sales';
    }

    // Engineering
    if (
      lower.includes('engineer') ||
      lower.includes('engenheiro') ||
      lower.includes('developer') ||
      lower.includes('desenvolvedor') ||
      lower.includes('programmer') ||
      lower.includes('tech') ||
      lower.includes('software')
    ) {
      return 'engineering';
    }

    // Management
    if (
      lower.includes('manager') ||
      lower.includes('gerente') ||
      lower.includes('director') ||
      lower.includes('diretor') ||
      lower.includes('líder') ||
      lower.includes('leader') ||
      lower.includes('head') ||
      lower.includes('chief') ||
      lower.includes('ceo') ||
      lower.includes('cto') ||
      lower.includes('cfo')
    ) {
      return 'management';
    }

    // Operations
    if (
      lower.includes('operations') ||
      lower.includes('operações') ||
      lower.includes('logistics') ||
      lower.includes('logística') ||
      lower.includes('supply') ||
      lower.includes('production') ||
      lower.includes('produção')
    ) {
      return 'operations';
    }

    // Creative
    if (
      lower.includes('design') ||
      lower.includes('creative') ||
      lower.includes('criativo') ||
      lower.includes('marketing') ||
      lower.includes('content') ||
      lower.includes('conteúdo') ||
      lower.includes('ux') ||
      lower.includes('ui')
    ) {
      return 'creative';
    }

    // Support
    if (
      lower.includes('support') ||
      lower.includes('suporte') ||
      lower.includes('customer success') ||
      lower.includes('atendimento') ||
      lower.includes('service')
    ) {
      return 'support';
    }

    // Finance
    if (
      lower.includes('finance') ||
      lower.includes('financeiro') ||
      lower.includes('accounting') ||
      lower.includes('contabil') ||
      lower.includes('controller') ||
      lower.includes('analyst') ||
      lower.includes('analista')
    ) {
      return 'finance';
    }

    // HR
    if (
      lower.includes('hr') ||
      lower.includes('human resources') ||
      lower.includes('recursos humanos') ||
      lower.includes('people') ||
      lower.includes('talent') ||
      lower.includes('recrutamento') ||
      lower.includes('recruitment')
    ) {
      return 'hr';
    }

    return null;
  }

  /**
   * Extract seniority from job title
   */
  private extractSeniority(jobTitle: string): SeniorityTag | null {
    const lower = jobTitle.toLowerCase();

    // Executive
    if (
      lower.includes('ceo') ||
      lower.includes('cto') ||
      lower.includes('cfo') ||
      lower.includes('chief') ||
      lower.includes('president') ||
      lower.includes('vp') ||
      lower.includes('vice') ||
      lower.includes('executive')
    ) {
      return 'executive';
    }

    // Senior
    if (
      lower.includes('senior') ||
      lower.includes('sênior') ||
      lower.includes('sr.') ||
      lower.includes('lead') ||
      lower.includes('principal') ||
      lower.includes('staff')
    ) {
      return 'senior';
    }

    // Junior
    if (
      lower.includes('junior') ||
      lower.includes('júnior') ||
      lower.includes('jr.') ||
      lower.includes('trainee') ||
      lower.includes('estagiário') ||
      lower.includes('intern') ||
      lower.includes('assistant') ||
      lower.includes('assistente')
    ) {
      return 'junior';
    }

    // Mid (default if no other match)
    if (
      lower.includes('pleno') ||
      lower.includes('mid') ||
      lower.includes('specialist') ||
      lower.includes('especialista')
    ) {
      return 'mid';
    }

    // Default to mid if has professional title but no seniority indicator
    return 'mid';
  }

  /**
   * Extract objective from test objective string
   */
  private extractObjective(testObjective: string): ObjectiveTag | null {
    const lower = testObjective.toLowerCase();

    // Hiring
    if (
      lower.includes('hiring') ||
      lower.includes('recrutamento') ||
      lower.includes('recruitment') ||
      lower.includes('seleção') ||
      lower.includes('selection') ||
      lower.includes('contratação')
    ) {
      return 'hiring';
    }

    // Self-knowledge
    if (
      lower.includes('self') ||
      lower.includes('autoconhecimento') ||
      lower.includes('auto-conhecimento') ||
      lower.includes('personal') ||
      lower.includes('pessoal') ||
      lower.includes('conhecer')
    ) {
      return 'self-knowledge';
    }

    // Team-building
    if (
      lower.includes('team') ||
      lower.includes('equipe') ||
      lower.includes('grupo') ||
      lower.includes('colaboração') ||
      lower.includes('collaboration')
    ) {
      return 'team-building';
    }

    // Development
    if (
      lower.includes('development') ||
      lower.includes('desenvolvimento') ||
      lower.includes('growth') ||
      lower.includes('crescimento') ||
      lower.includes('training') ||
      lower.includes('treinamento') ||
      lower.includes('coaching')
    ) {
      return 'development';
    }

    return 'self-knowledge'; // Default
  }

  /**
   * Extract industry from company name or job title
   */
  private extractIndustry(text: string): IndustryTag | null {
    const lower = text.toLowerCase();

    // Technology
    if (
      lower.includes('tech') ||
      lower.includes('software') ||
      lower.includes('digital') ||
      lower.includes('startup') ||
      lower.includes('saas') ||
      lower.includes('it') ||
      lower.includes('data') ||
      lower.includes('cloud')
    ) {
      return 'technology';
    }

    // Finance
    if (
      lower.includes('bank') ||
      lower.includes('banco') ||
      lower.includes('finance') ||
      lower.includes('financeiro') ||
      lower.includes('investment') ||
      lower.includes('insurance') ||
      lower.includes('seguros')
    ) {
      return 'finance';
    }

    // Healthcare
    if (
      lower.includes('health') ||
      lower.includes('saúde') ||
      lower.includes('hospital') ||
      lower.includes('medical') ||
      lower.includes('pharma') ||
      lower.includes('clinic')
    ) {
      return 'healthcare';
    }

    // Retail
    if (
      lower.includes('retail') ||
      lower.includes('varejo') ||
      lower.includes('store') ||
      lower.includes('loja') ||
      lower.includes('ecommerce') ||
      lower.includes('e-commerce')
    ) {
      return 'retail';
    }

    // Services
    if (
      lower.includes('consulting') ||
      lower.includes('consultoria') ||
      lower.includes('service') ||
      lower.includes('serviço') ||
      lower.includes('agency') ||
      lower.includes('agência')
    ) {
      return 'services';
    }

    // Manufacturing
    if (
      lower.includes('manufacturing') ||
      lower.includes('manufatura') ||
      lower.includes('industrial') ||
      lower.includes('factory') ||
      lower.includes('fábrica') ||
      lower.includes('production') ||
      lower.includes('produção')
    ) {
      return 'manufacturing';
    }

    // Education
    if (
      lower.includes('education') ||
      lower.includes('educação') ||
      lower.includes('school') ||
      lower.includes('escola') ||
      lower.includes('university') ||
      lower.includes('universidade') ||
      lower.includes('training') ||
      lower.includes('treinamento')
    ) {
      return 'education';
    }

    return null;
  }

  /**
   * Match tags between question and context
   * Returns score 0-100 based on overlap
   */
  matchTags(questionTags: string[], contextTags: string[]): number {
    if (questionTags.length === 0 || contextTags.length === 0) {
      return 0;
    }

    const matches = questionTags.filter((tag) =>
      contextTags.some((ctag) => ctag.toLowerCase() === tag.toLowerCase())
    );

    // Calculate percentage of question tags that match context
    return Math.round((matches.length / questionTags.length) * 100);
  }

  /**
   * Calculate overall context score for a question
   * Considers all context dimensions
   */
  calculateContextScore(question: QuestionBankEntry, context: UserContext): number {
    let totalScore = 0;
    let factorCount = 0;

    // Profession match (weight: 30%)
    if (context.profession && question.profession_tags.length > 0) {
      const professionMatch = question.profession_tags.includes(context.profession) ? 100 : 0;
      totalScore += professionMatch * 0.3;
      factorCount++;
    }

    // Seniority match (weight: 20%)
    if (context.seniority && question.seniority_tags.length > 0) {
      const seniorityMatch = question.seniority_tags.includes(context.seniority) ? 100 : 0;
      totalScore += seniorityMatch * 0.2;
      factorCount++;
    }

    // Industry match (weight: 20%)
    if (context.industry && question.industry_tags.length > 0) {
      const industryMatch = question.industry_tags.includes(context.industry) ? 100 : 0;
      totalScore += industryMatch * 0.2;
      factorCount++;
    }

    // Objective match (weight: 30%)
    if (context.test_objective) {
      const objectiveTag = this.extractObjective(context.test_objective);
      if (objectiveTag && question.objective_tags.length > 0) {
        const objectiveMatch = question.objective_tags.includes(objectiveTag) ? 100 : 0;
        totalScore += objectiveMatch * 0.3;
        factorCount++;
      }
    }

    // If no factors matched, return neutral score
    if (factorCount === 0) {
      return 50;
    }

    // Normalize to 0-100 range
    return Math.round(totalScore);
  }

  /**
   * Get context summary for logging/debugging
   */
  getContextSummary(context: ExtractedContext): string {
    const parts: string[] = [];

    if (context.profession) parts.push(`Profession: ${context.profession}`);
    if (context.seniority) parts.push(`Seniority: ${context.seniority}`);
    if (context.objective) parts.push(`Objective: ${context.objective}`);
    if (context.industry) parts.push(`Industry: ${context.industry}`);

    parts.push(`Confidence: ${(context.confidence * 100).toFixed(0)}%`);

    return parts.join(', ');
  }
}

// Export singleton instance
export const contextEngine = new ContextEngineClass();
