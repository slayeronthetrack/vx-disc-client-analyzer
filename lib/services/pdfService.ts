/**
 * PDF Service - VX DISC
 * Gera relatório PDF profissional do resultado DISC
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface UserProfile {
  full_name: string;
  email: string;
  job_title?: string;
  company?: string;
}

interface PDFData {
  userProfile: UserProfile;
  dominantProfile: 'D' | 'I' | 'S' | 'C';
  scores: DISCScores;
  aiAnalysis: string;
  completedAt: string;
}

const profileDescriptions = {
  D: {
    name: 'Dominância',
    color: [220, 38, 38], // red-600
    description: 'Orientado para resultados, direto e gosta de desafios.',
    characteristics: [
      'Decisivo e orientado para resultados',
      'Gosta de desafios e competição',
      'Comunicação direta e objetiva',
      'Assume riscos calculados',
      'Foco em eficiência e produtividade',
    ],
  },
  I: {
    name: 'Influência',
    color: [234, 179, 8], // yellow-600
    description: 'Entusiasta, sociável e gosta de interagir com pessoas.',
    characteristics: [
      'Comunicativo e expressivo',
      'Entusiasta e otimista',
      'Gosta de trabalhar em equipe',
      'Persuasivo e inspirador',
      'Foco em relacionamentos',
    ],
  },
  S: {
    name: 'Estabilidade',
    color: [22, 163, 74], // green-600
    description: 'Paciente, leal e busca harmonia.',
    characteristics: [
      'Paciente e calmo',
      'Leal e confiável',
      'Busca harmonia e estabilidade',
      'Bom ouvinte',
      'Trabalha bem em equipe',
    ],
  },
  C: {
    name: 'Conformidade',
    color: [37, 99, 235], // blue-600
    description: 'Analítico, preciso e focado em qualidade.',
    characteristics: [
      'Analítico e preciso',
      'Focado em qualidade',
      'Sistemático e organizado',
      'Atenção aos detalhes',
      'Baseado em fatos e dados',
    ],
  },
};

export class PDFService {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
  }

  /**
   * Gera PDF completo do resultado DISC
   */
  async generateReport(data: PDFData): Promise<Blob> {
    // Página 1: Capa
    this.addCoverPage(data);

    // Página 2: Informações do Usuário
    this.doc.addPage();
    this.currentY = this.margin;
    this.addUserInfo(data);

    // Página 3: Resultado DISC
    this.doc.addPage();
    this.currentY = this.margin;
    this.addDISCResult(data);

    // Página 4: Análise IA
    this.doc.addPage();
    this.currentY = this.margin;
    this.addAIAnalysis(data);

    // Página 5: Recomendações
    this.doc.addPage();
    this.currentY = this.margin;
    this.addRecommendations(data);

    // Rodapé em todas as páginas
    this.addFooters();

    // Retornar blob
    return this.doc.output('blob');
  }

  /**
   * Página 1: Capa
   */
  private addCoverPage(data: PDFData) {
    const centerX = this.pageWidth / 2;

    // Logo VX (simulado com texto estilizado)
    this.doc.setFillColor(247, 151, 30); // Laranja VX
    this.doc.roundedRect(centerX - 30, 60, 60, 60, 10, 10, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(40);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('VX', centerX, 100, { align: 'center' });

    // Título
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(32);
    this.doc.text('Relatório DISC', centerX, 150, { align: 'center' });

    // Subtítulo
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    this.doc.text('Análise de Perfil Comportamental', centerX, 165, { align: 'center' });

    // Nome do usuário
    this.doc.setFontSize(20);
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(data.userProfile.full_name, centerX, 200, { align: 'center' });

    // Data
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    const date = new Date(data.completedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
    this.doc.text(date, centerX, 215, { align: 'center' });

    // Perfil dominante
    const profile = profileDescriptions[data.dominantProfile];
    this.doc.setFillColor(...profile.color);
    this.doc.roundedRect(centerX - 60, 240, 120, 30, 5, 5, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Perfil: ${profile.name}`, centerX, 260, { align: 'center' });
  }

  /**
   * Página 2: Informações do Usuário
   */
  private addUserInfo(data: PDFData) {
    this.addSectionTitle('Informações do Participante');

    // Tabela de informações
    const tableData = [
      ['Nome', data.userProfile.full_name],
      ['Email', data.userProfile.email],
    ];

    if (data.userProfile.job_title) {
      tableData.push(['Cargo', data.userProfile.job_title]);
    }

    if (data.userProfile.company) {
      tableData.push(['Empresa', data.userProfile.company]);
    }

    const date = new Date(data.completedAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    tableData.push(['Data do Teste', date]);

    (this.doc as any).autoTable({
      startY: this.currentY,
      head: [['Campo', 'Valor']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [247, 151, 30],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 11,
        cellPadding: 8,
      },
    });

    this.currentY = (this.doc as any).lastAutoTable.finalY + 20;

    // Sobre o teste DISC
    this.addSectionTitle('Sobre o Teste DISC');
    this.addParagraph(
      'O teste DISC é uma ferramenta de avaliação comportamental que identifica ' +
      'padrões de comportamento em quatro dimensões principais: Dominância (D), ' +
      'Influência (I), Estabilidade (S) e Conformidade (C). Este relatório apresenta ' +
      'uma análise completa do seu perfil comportamental, incluindo pontos fortes, ' +
      'áreas de atenção e recomendações personalizadas.'
    );
  }

  /**
   * Página 3: Resultado DISC
   */
  private addDISCResult(data: PDFData) {
    this.addSectionTitle('Seu Resultado DISC');

    // Perfil dominante
    const profile = profileDescriptions[data.dominantProfile];
    this.doc.setFillColor(...profile.color);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, 5, 5, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Perfil Predominante: ${profile.name}`, this.margin + 10, this.currentY + 15);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(profile.description, this.margin + 10, this.currentY + 30);

    this.currentY += 50;

    // Gráfico de scores (barras horizontais)
    this.addSectionTitle('Distribuição dos Pilares DISC');

    const maxScore = Math.max(...Object.values(data.scores));
    const barHeight = 20;
    const barSpacing = 30;
    const maxBarWidth = this.pageWidth - 2 * this.margin - 60;

    Object.entries(data.scores).forEach(([key, score], index) => {
      const discKey = key as keyof typeof profileDescriptions;
      const profile = profileDescriptions[discKey];
      const percentage = (score / maxScore) * 100;
      const barWidth = (percentage / 100) * maxBarWidth;

      const y = this.currentY + index * barSpacing;

      // Label
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${profile.name} (${key})`, this.margin, y + 15);

      // Barra
      this.doc.setFillColor(220, 220, 220);
      this.doc.roundedRect(this.margin + 50, y, maxBarWidth, barHeight, 3, 3, 'F');
      
      this.doc.setFillColor(...profile.color);
      this.doc.roundedRect(this.margin + 50, y, barWidth, barHeight, 3, 3, 'F');

      // Score
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${score} pontos`, this.margin + 55 + maxBarWidth, y + 15);
    });

    this.currentY += Object.keys(data.scores).length * barSpacing + 20;

    // Características principais
    this.addSectionTitle('Características Principais');
    profile.characteristics.forEach((char, index) => {
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`• ${char}`, this.margin + 5, this.currentY + index * 8);
    });
  }

  /**
   * Página 4: Análise IA
   */
  private addAIAnalysis(data: PDFData) {
    this.addSectionTitle('Análise Personalizada com IA');

    // Ícone de IA
    this.doc.setFillColor(168, 85, 247); // purple-500
    this.doc.circle(this.margin + 5, this.currentY - 5, 5, 'F');
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(8);
    this.doc.text('AI', this.margin + 2, this.currentY - 2);

    this.currentY += 10;

    // Análise
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    const lines = this.doc.splitTextToSize(
      data.aiAnalysis,
      this.pageWidth - 2 * this.margin
    );

    lines.forEach((line: string, index: number) => {
      if (this.currentY > this.pageHeight - this.margin - 20) {
        this.doc.addPage();
        this.currentY = this.margin;
      }
      this.doc.text(line, this.margin, this.currentY + index * 6);
    });
  }

  /**
   * Página 5: Recomendações
   */
  private addRecommendations(data: PDFData) {
    this.addSectionTitle('Recomendações Práticas');

    const recommendations = [
      {
        title: 'Desenvolvimento Pessoal',
        items: [
          'Continue desenvolvendo seus pontos fortes naturais',
          'Trabalhe nas áreas de atenção identificadas',
          'Busque feedback regular de colegas e superiores',
          'Invista em autoconhecimento contínuo',
        ],
      },
      {
        title: 'Comunicação',
        items: [
          'Adapte seu estilo de comunicação ao perfil do interlocutor',
          'Pratique a escuta ativa',
          'Seja claro e objetivo em suas mensagens',
          'Considere o contexto emocional das conversas',
        ],
      },
      {
        title: 'Trabalho em Equipe',
        items: [
          'Reconheça e valorize diferentes estilos comportamentais',
          'Busque complementaridade com outros perfis',
          'Seja flexível em situações de conflito',
          'Contribua com suas forças únicas para o time',
        ],
      },
      {
        title: 'Próximos Passos',
        items: [
          'Compartilhe este relatório com seu gestor ou coach',
          'Defina metas de desenvolvimento baseadas nos insights',
          'Refaça o teste periodicamente para acompanhar sua evolução',
          'Aplique os aprendizados no dia a dia',
        ],
      },
    ];

    recommendations.forEach((section) => {
      if (this.currentY > this.pageHeight - this.margin - 60) {
        this.doc.addPage();
        this.currentY = this.margin;
      }

      this.doc.setFontSize(14);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(247, 151, 30);
      this.doc.text(section.title, this.margin, this.currentY);
      this.currentY += 10;

      section.items.forEach((item) => {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(0, 0, 0);
        this.doc.text(`• ${item}`, this.margin + 5, this.currentY);
        this.currentY += 7;
      });

      this.currentY += 5;
    });

    // Mensagem final
    this.currentY += 10;
    this.doc.setFillColor(247, 151, 30);
    this.doc.roundedRect(
      this.margin,
      this.currentY,
      this.pageWidth - 2 * this.margin,
      30,
      5,
      5,
      'F'
    );
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    const centerX = this.pageWidth / 2;
    this.doc.text(
      'Obrigado por usar o Sistema VX DISC!',
      centerX,
      this.currentY + 12,
      { align: 'center' }
    );
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      'Para mais informações, visite nosso site',
      centerX,
      this.currentY + 22,
      { align: 'center' }
    );
  }

  /**
   * Adiciona título de seção
   */
  private addSectionTitle(title: string) {
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(247, 151, 30);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 12;
  }

  /**
   * Adiciona parágrafo
   */
  private addParagraph(text: string) {
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 0);
    const lines = this.doc.splitTextToSize(text, this.pageWidth - 2 * this.margin);
    lines.forEach((line: string, index: number) => {
      this.doc.text(line, this.margin, this.currentY + index * 6);
    });
    this.currentY += lines.length * 6 + 10;
  }

  /**
   * Adiciona rodapés em todas as páginas
   */
  private addFooters() {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Linha
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(
        this.margin,
        this.pageHeight - 15,
        this.pageWidth - this.margin,
        this.pageHeight - 15
      );

      // Texto
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(
        'VX DISC - Sistema de Análise de Perfil Comportamental',
        this.margin,
        this.pageHeight - 10
      );
      this.doc.text(
        `Página ${i} de ${pageCount}`,
        this.pageWidth - this.margin,
        this.pageHeight - 10,
        { align: 'right' }
      );
    }
  }
}

// Função helper para gerar PDF
export async function generateDISCReport(data: PDFData): Promise<Blob> {
  const pdfService = new PDFService();
  return await pdfService.generateReport(data);
}

// Função helper para download
export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
