'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Logo from '@/components/Logo';
import { loadTestResult, clearTestData } from '@/utils/storage';
import type { DISCResult } from '@/types/disc';

const profileNames: Record<string, string> = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

const profileColors: Record<string, string> = {
  D: 'from-red-500 to-red-600',
  I: 'from-yellow-500 to-yellow-600',
  S: 'from-green-500 to-green-600',
  C: 'from-blue-500 to-blue-600',
};

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DISCResult | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const savedResult = loadTestResult();
    
    if (!savedResult) {
      router.push('/');
      return;
    }
    
    setResult(savedResult);
    setLoading(false);
  }, [router]);
  
  const handleNewTest = () => {
    clearTestData();
    router.push('/test');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-vx-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vx-orange mx-auto mb-4"></div>
          <p className="text-vx-gray">Carregando resultado...</p>
        </div>
      </div>
    );
  }
  
  if (!result) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-vx-dark">
      {/* Header */}
      <header className="border-b border-vx-orange/20">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <Logo />
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Result */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${profileColors[result.dominant]} flex items-center justify-center shadow-2xl`}>
              <span className="text-6xl font-bold text-white">{result.dominant}</span>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold text-white mb-4">
            SEU PERFIL É
          </h1>
          <p className="text-4xl text-vx-orange font-bold mb-6">
            {profileNames[result.dominant].toUpperCase()}
          </p>
          <p className="text-vx-gray text-lg max-w-2xl mx-auto">
            Descubra como usar seu perfil comportamental para potencializar seus resultados comerciais
          </p>
        </div>
        
        {/* Scores Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {Object.entries(result.scores).map(([key, value]) => (
            <Card key={key} className="text-center hover:border-vx-orange/50 transition-all">
              <div className="text-5xl font-bold text-vx-orange mb-3">
                {value}%
              </div>
              <div className="text-white font-semibold text-lg mb-1">
                {key}
              </div>
              <div className="text-vx-gray text-sm">
                {profileNames[key]}
              </div>
            </Card>
          ))}
        </div>
        
        {/* Description */}
        <Card className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-vx-orange">🎯</span>
            SOBRE SEU PERFIL
          </h2>
          <p className="text-vx-gray text-lg leading-relaxed">
            {result.profile.description}
          </p>
        </Card>
        
        {/* Strengths */}
        <Card className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-vx-orange">💪</span>
            PONTOS FORTES
          </h2>
          <ul className="space-y-4">
            {result.profile.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-4 text-vx-gray text-lg">
                <span className="text-vx-orange text-2xl flex-shrink-0">•</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* Communication Style */}
        <Card className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-vx-orange">💬</span>
            ESTILO DE COMUNICAÇÃO
          </h2>
          <ul className="space-y-4">
            {result.profile.communicationStyle.map((tip, index) => (
              <li key={index} className="flex items-start gap-4 text-vx-gray text-lg">
                <span className="text-vx-orange text-2xl flex-shrink-0">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* Sales Approach */}
        <Card className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="text-vx-orange">📈</span>
            ABORDAGEM COMERCIAL
          </h2>
          <ul className="space-y-4">
            {result.profile.salesApproach.map((approach, index) => (
              <li key={index} className="flex items-start gap-4 text-vx-gray text-lg">
                <span className="text-vx-orange text-2xl flex-shrink-0">•</span>
                <span>{approach}</span>
              </li>
            ))}
          </ul>
        </Card>
        
        {/* CTA Section */}
        <div className="bg-gradient-to-r from-vx-orange to-orange-600 rounded-2xl p-12 text-center mb-12">
          <h2 className="text-3xl font-bold text-vx-dark mb-4">
            QUER APLICAR ISSO NO SEU TIME DE VENDAS?
          </h2>
          <p className="text-vx-dark/80 text-lg mb-8 max-w-2xl mx-auto">
            A VX Consultoria ajuda empresas a estruturar processos comerciais usando metodologias como DISC para aumentar performance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={handleNewTest}
              className="bg-vx-dark text-white border-vx-dark hover:bg-vx-dark-secondary"
            >
              Refazer Teste
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="bg-transparent text-vx-dark border-vx-dark hover:bg-vx-dark/10"
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-vx-dark-secondary border-t border-vx-orange/20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Logo className="mx-auto mb-4" />
          <p className="text-vx-gray text-sm">
            Especializada em Estruturação Comercial, Implantação de CRM
          </p>
        </div>
      </footer>
    </div>
  );
}
