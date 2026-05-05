import type { ClientRecord, DashboardMetrics } from '@/types';

export const mockClients: ClientRecord[] = [
  {
    id: '1',
    name: 'João Silva',
    company: 'Tech Solutions Ltda',
    email: 'joao.silva@techsolutions.com',
    testDate: '2024-01-15',
    status: 'completed',
    dominantProfile: 'D',
  },
  {
    id: '2',
    name: 'Maria Santos',
    company: 'Inovação Digital',
    email: 'maria.santos@inovacao.com',
    testDate: '2024-01-18',
    status: 'completed',
    dominantProfile: 'I',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    company: 'Consultoria Estratégica',
    email: 'pedro@consultoria.com',
    testDate: '2024-01-20',
    status: 'in-progress',
  },
  {
    id: '4',
    name: 'Ana Costa',
    company: 'Gestão Empresarial',
    email: 'ana.costa@gestao.com',
    testDate: '2024-01-22',
    status: 'pending',
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    company: 'Desenvolvimento Corp',
    email: 'carlos@desenvolvimento.com',
    testDate: '2024-01-25',
    status: 'completed',
    dominantProfile: 'C',
  },
  {
    id: '6',
    name: 'Juliana Ferreira',
    company: 'Marketing Pro',
    email: 'juliana@marketingpro.com',
    testDate: '2024-01-28',
    status: 'completed',
    dominantProfile: 'I',
  },
  {
    id: '7',
    name: 'Roberto Lima',
    company: 'Finanças & Cia',
    email: 'roberto@financas.com',
    testDate: '2024-01-30',
    status: 'in-progress',
  },
];

export const mockMetrics: DashboardMetrics = {
  totalTests: 7,
  completedTests: 4,
  pendingTests: 1,
  inProgressTests: 2,
};

export function getClients(): ClientRecord[] {
  return mockClients;
}

export function getMetrics(): DashboardMetrics {
  return mockMetrics;
}
