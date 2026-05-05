import type { TestProgress, DISCResult } from '@/types/disc';

const STORAGE_KEYS = {
  TEST_PROGRESS: 'disc_test_progress',
  TEST_RESULT: 'disc_test_result',
} as const;

export function saveTestProgress(progress: TestProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_PROGRESS, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving test progress:', error);
  }
}

export function loadTestProgress(): TestProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEST_PROGRESS);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading test progress:', error);
    return null;
  }
}

export function saveTestResult(result: DISCResult): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.TEST_RESULT, JSON.stringify(result));
  } catch (error) {
    console.error('Error saving test result:', error);
  }
}

export function loadTestResult(): DISCResult | null {
  if (typeof window === 'undefined') return null;
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TEST_RESULT);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error loading test result:', error);
    return null;
  }
}

export function clearTestData(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS.TEST_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.TEST_RESULT);
  } catch (error) {
    console.error('Error clearing test data:', error);
  }
}
