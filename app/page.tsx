/**
 * Home Page - VX DISC Test
 * Página inicial do sistema de teste DISC
 */

'use client';

import Link from 'next/link';
import { ArrowRight, User, ClipboardList } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 mb-6">
              <span className="text-gray-900 font-bold text-3xl">VX</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Teste DISC
            </h1>
            <p className="text-xl text-gray-300 mb-2">
              VX Consultoria
            </p>
          </div>

          {/* Main Description */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Descubra Seu Perfil Comportamental
            </h2>
            <p className="text-lg text-gray-300 mb-6">
              O teste DISC é uma ferramenta poderosa para identificar seu estilo de comportamento e comunicação. 
              Compreenda melhor suas características e como você interage com outras pessoas.
            </p>
            <div className="grid md:grid-cols-4 gap-4 text-left">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h3 className="text-red-400 font-bold mb-2">Dominância</h3>
                <p className="text-gray-400 text-sm">Foco em resultados e desafios</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <h3 className="text-yellow-400 font-bold mb-2">Influência</h3>
                <p className="text-gray-400 text-sm">Foco em pessoas e entusiasmo</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h3 className="text-green-400 font-bold mb-2">Estabilidade</h3>
                <p className="text-gray-400 text-sm">Foco em harmonia e consistência</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <h3 className="text-blue-400 font-bold mb-2">Conformidade</h3>
                <p className="text-gray-400 text-sm">Foco em precisão e qualidade</p>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/test"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105"
            >
              <ClipboardList size={24} />
              Fazer Teste
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/profile"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gray-800 border-2 border-orange-500 text-orange-500 font-bold text-lg rounded-xl hover:bg-orange-500 hover:text-gray-900 transition-all duration-300"
            >
              <User size={24} />
              Configurar Perfil
            </Link>
          </div>

          {/* Info Section */}
          <div className="mt-16 text-gray-400 text-sm">
            <p>✓ Teste rápido e objetivo</p>
            <p>✓ Resultado imediato</p>
            <p>✓ Análise profissional</p>
          </div>
        </div>
      </div>
    </div>
  );
}
