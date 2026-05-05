'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Logo from '@/components/Logo';

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-vx-dark">
      {/* Header */}
      <header className="border-b border-vx-orange/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Logo />
          <Button 
            variant="outline" 
            onClick={() => router.push('/')}
          >
            Início
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            DASHBOARD <span className="text-vx-orange">VX</span>
          </h1>
          <p className="text-vx-gray text-lg">
            Visão geral dos diagnósticos e métricas comerciais
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="hover:border-vx-orange/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vx-gray text-sm font-semibold uppercase tracking-wide">
                Testes Realizados
              </h3>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-5xl font-bold text-vx-orange mb-2">127</p>
            <p className="text-vx-gray text-sm">+23% vs mês anterior</p>
          </Card>

          <Card className="hover:border-vx-orange/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vx-gray text-sm font-semibold uppercase tracking-wide">
                Taxa de Conclusão
              </h3>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-5xl font-bold text-vx-orange mb-2">87%</p>
            <p className="text-vx-gray text-sm">+5% vs mês anterior</p>
          </Card>

          <Card className="hover:border-vx-orange/50 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-vx-gray text-sm font-semibold uppercase tracking-wide">
                Leads Qualificados
              </h3>
              <span className="text-2xl">🎯</span>
            </div>
            <p className="text-5xl font-bold text-vx-orange mb-2">94</p>
            <p className="text-vx-gray text-sm">+18% vs mês anterior</p>
          </Card>
        </div>

        {/* Profile Distribution */}
        <Card className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-8">
            DISTRIBUIÇÃO DE PERFIS
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl">
                <span className="text-4xl font-bold text-white">D</span>
              </div>
              <p className="text-white font-semibold text-lg mb-1">Dominância</p>
              <p className="text-vx-orange text-3xl font-bold">28%</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-xl">
                <span className="text-4xl font-bold text-white">I</span>
              </div>
              <p className="text-white font-semibold text-lg mb-1">Influência</p>
              <p className="text-vx-orange text-3xl font-bold">35%</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-xl">
                <span className="text-4xl font-bold text-white">S</span>
              </div>
              <p className="text-white font-semibold text-lg mb-1">Estabilidade</p>
              <p className="text-vx-orange text-3xl font-bold">22%</p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-xl">
                <span className="text-4xl font-bold text-white">C</span>
              </div>
              <p className="text-white font-semibold text-lg mb-1">Conformidade</p>
              <p className="text-vx-orange text-3xl font-bold">15%</p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="bg-gradient-to-r from-vx-orange to-orange-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-vx-dark mb-4">
            PRONTO PARA FAZER SEU DIAGNÓSTICO?
          </h2>
          <p className="text-vx-dark/80 text-lg mb-8 max-w-2xl mx-auto">
            Descubra seu perfil comportamental e receba insights personalizados para melhorar sua performance comercial
          </p>
          <Button 
            variant="outline"
            onClick={() => router.push('/test')}
            className="bg-vx-dark text-white border-vx-dark hover:bg-vx-dark-secondary text-lg px-8 py-4"
          >
            INICIAR TESTE AGORA
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-vx-dark-secondary border-t border-vx-orange/20 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Logo className="mx-auto mb-4" />
          <p className="text-vx-gray text-sm">
            Especializada em Estruturação Comercial, Implantação de CRM
          </p>
        </div>
      </footer>
    </div>
  );
}
