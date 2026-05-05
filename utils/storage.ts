import type { TestProgress, DISCResult } from '@/types';

// Chaves padronizadas do localStorage
export const STORAGE_KEYS = {
  TEST: 'vx_disc_test',
  RESULT: 'vx_disc_result',
} as const;

// Salvar progresso do teste
export function saveTestProgress(progress: TestProgress): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.TEST, JSON.stringify(progress));
  } catch (error) {
    console.error('Erro ao salvar progresso do teste:', error);
  }
}

// Carregar progresso do teste
export function loadTestProgress(): TestProgress | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEST);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar progresso do teste:', error);
    return null;
  }
}

// Salvar resultado do teste
export function saveResult(result: DISCResult): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.RESULT, JSON.stringify(result));
  } catch (error) {
    console.error('Erro ao salvar resultado:', error);
  }
}

// Carregar resultado do teste
export function loadResult(): DISCResult | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.RESULT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar resultado:', error);
    return null;
  }
}

// Limpar dados do teste
export function clearTestData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.TEST);
    localStorage.removeItem(STORAGE_KEYS.RESULT);
  } catch (error) {
    console.error('Erro ao limpar dados do teste:', error);
  }
}
