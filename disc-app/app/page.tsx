'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Logo from '@/components/Logo';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-vx-dark">
      {/* Header */}
      <header className="border-b border-vx-orange/20">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <Logo />
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 right-20 w-96 h-96 border-2 border-vx-orange rotate-45" />
          <div className="absolute bottom-20 left-20 w-64 h-64 border-2 border-vx-orange rotate-12" />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-24 text-center">
          <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
            <span className="text-white">DESCUBRA SEU</span>
            <br />
            <span className="text-vx-orange">PERFIL COMPORTAMENTAL</span>
          </h1>
          
          <p className="text-xl text-vx-gray max-w-3xl mx-auto mb-12 leading-relaxed">
            Entenda como você toma decisões, se comunica e responde a desafios. 
            Um diagnóstico profissional baseado na metodologia DISC.
          </p>

          <Button 
            size="lg" 
            onClick={() => router.push('/test')}
            className="text-lg px-12 py-6"
          >
            INICIAR DIAGNÓSTICO GRATUITO
          </Button>

          <p className="text-vx-gray text-sm mt-6">
            ⏱️ Leva apenas 5 minutos • Resultado imediato
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-vx-dark-secondary py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-vx-orange">POR QUE</span>{' '}
            <span className="text-white">FAZER O TESTE DISC?</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-vx-dark border border-vx-orange/20 p-8 rounded-lg hover:border-vx-orange/50 transition-all">
              <div className="w-16 h-16 bg-vx-orange/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                AUTOCONHECIMENTO
              </h3>
              <p className="text-vx-gray leading-relaxed">
                Entenda seus pontos fortes, áreas de desenvolvimento e como você se comporta em diferentes situações.
              </p>
            </div>

            <div className="bg-vx-dark border border-vx-orange/20 p-8 rounded-lg hover:border-vx-orange/50 transition-all">
              <div className="w-16 h-16 bg-vx-orange/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                PERFORMANCE COMERCIAL
              </h3>
              <p className="text-vx-gray leading-relaxed">
                Descubra como aplicar seu perfil para vender mais, negociar melhor e fechar mais negócios.
              </p>
            </div>

            <div className="bg-vx-dark border border-vx-orange/20 p-8 rounded-lg hover:border-vx-orange/50 transition-all">
              <div className="w-16 h-16 bg-vx-orange/10 rounded-lg flex items-center justify-center mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">
                RESULTADOS RÁPIDOS
              </h3>
              <p className="text-vx-gray leading-relaxed">
                Receba insights práticos e acionáveis para aplicar imediatamente no seu dia a dia comercial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-16">
            <span className="text-white">COMO</span>{' '}
            <span className="text-vx-orange">FUNCIONA</span>
          </h2>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-vx-orange rounded-lg flex items-center justify-center">
                <span className="text-vx-dark font-bold text-xl">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Responda 10 perguntas rápidas
                </h3>
                <p className="text-vx-gray">
                  Perguntas objetivas sobre como você age em situações do dia a dia profissional.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-vx-orange rounded-lg flex items-center justify-center">
                <span className="text-vx-dark font-bold text-xl">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Receba seu perfil DISC
                </h3>
                <p className="text-vx-gray">
                  Descubra se você é Dominante, Influente, Estável ou Conforme - ou uma combinação deles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-vx-orange rounded-lg flex items-center justify-center">
                <span className="text-vx-dark font-bold text-xl">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Aplique os insights
                </h3>
                <p className="text-vx-gray">
                  Use as recomendações personalizadas para melhorar sua comunicação e performance em vendas.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <Button 
              size="lg" 
              onClick={() => router.push('/test')}
              className="text-lg px-12 py-6"
            >
              COMEÇAR AGORA
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-vx-orange to-orange-600 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-vx-dark mb-6">
            AQUI NA VX, CAMINHAMOS LADO A LADO COM SEU TIME DE VENDAS
          </h2>
          <p className="text-vx-dark/80 text-lg mb-8">
            Na mesma estratégia, com foco em resultado e com quem é referência
          </p>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => router.push('/test')}
            className="bg-vx-dark text-white border-vx-dark hover:bg-vx-dark-secondary"
          >
            FAZER DIAGNÓSTICO AGORA
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-vx-dark-secondary border-t border-vx-orange/20 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Logo className="mx-auto mb-4" />
          <p className="text-vx-gray text-sm">
            Especializada em Estruturação Comercial, Implantação de CRM
          </p>
          <p className="text-vx-gray/60 text-xs mt-4">
            © 2026 VX Consultoria. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
