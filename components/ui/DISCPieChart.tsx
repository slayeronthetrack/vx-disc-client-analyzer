/**
 * DISC Pie Chart Component
 * Gráfico de pizza para visualização dos scores DISC
 */

'use client';

import { useState } from 'react';

interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface DISCPieChartProps {
  scores: DISCScores;
  dominantProfile: 'D' | 'I' | 'S' | 'C';
}

const profileColors = {
  D: {
    main: '#ef4444', // red-500
    light: '#fca5a5', // red-300
    dark: '#dc2626', // red-600
  },
  I: {
    main: '#eab308', // yellow-500
    light: '#fde047', // yellow-300
    dark: '#ca8a04', // yellow-600
  },
  S: {
    main: '#22c55e', // green-500
    light: '#86efac', // green-300
    dark: '#16a34a', // green-600
  },
  C: {
    main: '#3b82f6', // blue-500
    light: '#93c5fd', // blue-300
    dark: '#2563eb', // blue-600
  },
};

const profileInsights = {
  D: {
    strengths: [
      'Decisivo e orientado para resultados',
      'Assume riscos calculados',
      'Liderança natural e assertividade',
      'Foco em eficiência e produtividade',
    ],
    improvements: [
      'Desenvolver paciência e escuta ativa',
      'Considerar mais as emoções da equipe',
      'Evitar ser excessivamente direto',
      'Delegar com mais confiança',
    ],
  },
  I: {
    strengths: [
      'Comunicativo e persuasivo',
      'Entusiasta e otimista',
      'Excelente em networking',
      'Inspira e motiva pessoas',
    ],
    improvements: [
      'Melhorar foco e organização',
      'Ser mais objetivo nas comunicações',
      'Desenvolver atenção aos detalhes',
      'Cumprir prazos com mais rigor',
    ],
  },
  S: {
    strengths: [
      'Paciente e confiável',
      'Excelente ouvinte',
      'Trabalha bem em equipe',
      'Mantém harmonia no ambiente',
    ],
    improvements: [
      'Ser mais assertivo quando necessário',
      'Lidar melhor com mudanças rápidas',
      'Expressar opiniões com mais clareza',
      'Tomar decisões mais rapidamente',
    ],
  },
  C: {
    strengths: [
      'Analítico e preciso',
      'Focado em qualidade',
      'Sistemático e organizado',
      'Baseado em fatos e dados',
    ],
    improvements: [
      'Ser mais flexível com processos',
      'Tomar decisões sem dados completos',
      'Melhorar habilidades interpessoais',
      'Aceitar que "bom o suficiente" às vezes é adequado',
    ],
  },
};

const profileNames = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

export default function DISCPieChart({ scores, dominantProfile }: DISCPieChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<'D' | 'I' | 'S' | 'C' | null>(dominantProfile);

  // Calcular total e percentuais
  const total = scores.D + scores.I + scores.S + scores.C;
  const percentages = {
    D: (scores.D / total) * 100,
    I: (scores.I / total) * 100,
    S: (scores.S / total) * 100,
    C: (scores.C / total) * 100,
  };

  // Calcular ângulos para o SVG
  let currentAngle = -90; // Começar no topo
  const segments = (Object.keys(scores) as Array<keyof DISCScores>).map((key) => {
    const percentage = percentages[key];
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    return {
      key,
      percentage,
      startAngle,
      endAngle,
      score: scores[key],
    };
  });

  // Função para criar path do arco
  const createArc = (startAngle: number, endAngle: number, innerRadius: number, outerRadius: number) => {
    const start = polarToCartesian(50, 50, outerRadius, endAngle);
    const end = polarToCartesian(50, 50, outerRadius, startAngle);
    const innerStart = polarToCartesian(50, 50, innerRadius, endAngle);
    const innerEnd = polarToCartesian(50, 50, innerRadius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return [
      'M', start.x, start.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  // Converter coordenadas polares para cartesianas
  function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
    const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  // Calcular posição do label
  const getLabelPosition = (startAngle: number, endAngle: number, radius: number) => {
    const midAngle = (startAngle + endAngle) / 2;
    return polarToCartesian(50, 50, radius, midAngle);
  };

  return (
    <div className="w-full">
      {/* Layout Grid: Pizza à esquerda, Info à direita */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center mb-8">
        {/* Gráfico de Pizza */}
        <div className="relative w-full max-w-md mx-auto aspect-square">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-0">
            {/* Segmentos do gráfico */}
            {segments.map((segment) => {
              const isHovered = hoveredSegment === segment.key;
              const isDominant = dominantProfile === segment.key;
              const outerRadius = isHovered ? 42 : isDominant ? 40 : 38;
              const innerRadius = 20;

              return (
                <g key={segment.key}>
                  {/* Segmento */}
                  <path
                    d={createArc(segment.startAngle, segment.endAngle, innerRadius, outerRadius)}
                    fill={profileColors[segment.key].main}
                    stroke="rgba(17, 24, 39, 0.5)"
                    strokeWidth="0.5"
                    className="transition-all duration-300 cursor-pointer"
                    onMouseEnter={() => setHoveredSegment(segment.key)}
                    onMouseLeave={() => setHoveredSegment(dominantProfile)}
                    style={{
                      filter: isHovered ? 'brightness(1.2)' : isDominant ? 'brightness(1.1)' : 'brightness(1)',
                    }}
                  />

                  {/* Label de percentual */}
                  {segment.percentage > 5 && (
                    <text
                      x={getLabelPosition(segment.startAngle, segment.endAngle, 29).x}
                      y={getLabelPosition(segment.startAngle, segment.endAngle, 29).y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-white font-bold text-[4px] pointer-events-none"
                      style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {segment.percentage.toFixed(0)}%
                    </text>
                  )}
                </g>
              );
            })}

            {/* Círculo central */}
            <circle
              cx="50"
              cy="50"
              r="20"
              fill="rgb(31, 41, 55)"
              stroke="rgba(75, 85, 99, 0.5)"
              strokeWidth="0.5"
            />

            {/* Texto central */}
            <text
              x="50"
              y="48"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-white font-bold text-[6px]"
            >
              DISC
            </text>
            <text
              x="50"
              y="54"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-400 text-[3px]"
            >
              {total} pontos
            </text>
          </svg>
        </div>

        {/* Painel de Informações Fixo */}
        {hoveredSegment && (
          <div className="bg-gray-900 border-2 rounded-2xl p-6 shadow-2xl transition-all duration-300"
            style={{ borderColor: profileColors[hoveredSegment].main }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-6 h-6 rounded-full flex-shrink-0"
                style={{ backgroundColor: profileColors[hoveredSegment].main }}
              />
              <div className="flex-1">
                <h4 className="text-white font-bold text-xl">
                  {profileNames[hoveredSegment]}
                </h4>
                <p className="text-gray-400 text-sm">
                  {scores[hoveredSegment]} pontos ({percentages[hoveredSegment].toFixed(1)}%)
                </p>
              </div>
              {dominantProfile === hoveredSegment && (
                <span className="text-orange-500 text-2xl">★</span>
              )}
            </div>

            <div className="space-y-4">
              {/* Pontos Fortes */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-400 text-lg">✓</span>
                  <p className="text-green-400 font-semibold text-sm">Pontos Fortes:</p>
                </div>
                <ul className="space-y-2 ml-6">
                  {profileInsights[hoveredSegment].strengths.map((strength, i) => (
                    <li key={i} className="text-gray-300 text-sm leading-relaxed">
                      • {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Áreas de Melhoria */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-400 text-lg">⚠</span>
                  <p className="text-orange-400 font-semibold text-sm">Áreas de Melhoria:</p>
                </div>
                <ul className="space-y-2 ml-6">
                  {profileInsights[hoveredSegment].improvements.map((improvement, i) => (
                    <li key={i} className="text-gray-300 text-sm leading-relaxed">
                      • {improvement}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-gray-500 text-xs text-center">
                Clique nos cards abaixo ou passe o mouse no gráfico para ver outros perfis
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Legenda */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        {(Object.keys(scores) as Array<keyof DISCScores>).map((key) => {
          const isDominant = dominantProfile === key;
          const isHovered = hoveredSegment === key;

          return (
            <div
              key={key}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer ${
                isDominant
                  ? 'bg-gray-800 border-2 border-orange-500'
                  : 'bg-gray-800/50 border border-gray-700'
              } ${isHovered ? 'scale-105 shadow-lg' : ''}`}
              onClick={() => setHoveredSegment(key)}
            >
              {/* Cor */}
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: profileColors[key].main }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-white font-medium text-sm truncate">
                    {profileNames[key]}
                  </span>
                  {isDominant && (
                    <span className="text-orange-500 text-xs font-bold">★</span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="text-gray-400 text-xs">
                    {scores[key]} pts
                  </span>
                  <span className="text-gray-500 text-xs">
                    {percentages[key].toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
