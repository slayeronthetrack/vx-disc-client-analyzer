export interface ClientRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  testDate: string;
  status: 'pending' | 'completed' | 'in-progress';
  dominantProfile?: string;
}

export interface DashboardMetrics {
  totalTests: number;
  completedTests: number;
  pendingTests: number;
  inProgressTests: number;
}
