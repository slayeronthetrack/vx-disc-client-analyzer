'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/components/layout/Container';
import { Grid } from '@/components/layout/Grid';
import { Button } from '@/components/ui/Button';
import { Sidebar } from '@/components/ui/Sidebar';
import { MetricCard } from '@/components/ui/MetricCard';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/lib/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';

interface TestRecord {
  id: string;
  user_id: string;
  dominant_profile: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    company: string | null;
  };
}

interface Metrics {
  totalTests: number;
  completedTests: number;
  totalUsers: number;
  profileDistribution: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

const statusLabels: Record<string, string> = {
  completed: 'Completo',
  'in-progress': 'Em andamento',
  pending: 'Pendente',
};

const statusColors: Record<string, string> = {
  completed: 'text-green-400',
  'in-progress': 'text-yellow-400',
  pending: 'text-vx-gray',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<TestRecord[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalTests: 0,
    completedTests: 0,
    totalUsers: 0,
    profileDistribution: { D: 0, I: 0, S: 0, C: 0 },
  });
  
  useEffect(() => {
    // Redirecionar se não for admin
    if (!authLoading && (!user || !isAdmin)) {
      router.push('/');
      return;
    }
    
    if (user && isAdmin) {
      loadDashboardData();
    }
  }, [user, isAdmin, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar todos os testes com informações do usuário
      const { data: testsData, error: testsError } = await supabase
        .from('disc_tests')
        .select(`
          id,
          user_id,
          dominant_profile,
          created_at,
          profiles (
            full_name,
            email,
            company
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (testsError) throw testsError;

      setTests(testsData as TestRecord[] || []);

      // Calcular métricas
      const totalTests = testsData?.length || 0;
      const completedTests = totalTests; // Todos os testes salvos estão completos

      // Contar usuários únicos
      const uniqueUsers = new Set(testsData?.map(t => t.user_id) || []);
      const totalUsers = uniqueUsers.size;

      // Distribuição de perfis
      const distribution = { D: 0, I: 0, S: 0, C: 0 };
      testsData?.forEach(test => {
        const profile = test.dominant_profile as 'D' | 'I' | 'S' | 'C';
        if (profile && distribution[profile] !== undefined) {
          distribution[profile]++;
        }
      });

      setMetrics({
        totalTests,
        completedTests,
        totalUsers,
        profileDistribution: distribution,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (authLoading || loading) {
    return <Loading />;
  }
  
  if (!user || !isAdmin) {
    return null; // Vai redirecionar
  }
  
  return (
    <div className="flex min-h-screen bg-vx-dark">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <Container>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-title md:text-title text-title-mobile text-white">
              Dashboard VX
            </h1>
            <Button variant="primary" href="/test">
              + Novo Teste
            </Button>
          </div>
          
          {/* Metrics Overview */}
          <Grid cols={4} className="mb-12">
            <MetricCard 
              label="Total de Testes" 
              value={metrics.totalTests} 
              icon="📊"
            />
            <MetricCard 
              label="Completos" 
              value={metrics.completedTests} 
              icon="✅"
            />
            <MetricCard 
              label="Usuários" 
              value={metrics.totalUsers} 
              icon="👥"
            />
            <MetricCard 
              label="Perfil D" 
              value={metrics.profileDistribution.D} 
              icon="🎯"
            />
          </Grid>
          
          {/* Tests List */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Testes Recentes</h2>
            <Card hoverable={false}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.08]">
                      <th className="text-left py-3 px-4 text-vx-gray font-semibold">Nome</th>
                      <th className="text-left py-3 px-4 text-vx-gray font-semibold">E-mail</th>
                      <th className="text-left py-3 px-4 text-vx-gray font-semibold">Empresa</th>
                      <th className="text-left py-3 px-4 text-vx-gray font-semibold">Data</th>
                      <th className="text-left py-3 px-4 text-vx-gray font-semibold">Perfil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tests.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-gray-500">
                          Nenhum teste realizado ainda
                        </td>
                      </tr>
                    ) : (
                      tests.map((test) => (
                        <tr 
                          key={test.id} 
                          className="border-b border-white/[0.08] hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="py-3 px-4 text-white">{test.profiles.full_name}</td>
                          <td className="py-3 px-4 text-vx-gray">{test.profiles.email}</td>
                          <td className="py-3 px-4 text-vx-gray">{test.profiles.company || '-'}</td>
                          <td className="py-3 px-4 text-vx-gray">
                            {new Date(test.created_at).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-vx-orange font-semibold">
                            {test.dominant_profile}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </Container>
      </main>
    </div>
  );
}
