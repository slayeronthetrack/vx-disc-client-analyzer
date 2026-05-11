/**
 * Report Generator Utilities
 * Functions for generating PDF and CSV reports
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { CompanyTest } from '@/types/company-test';
import type { Company } from '@/types/company';

/**
 * Generate PDF report for individual employee
 */
export function generateEmployeePDF(test: CompanyTest, company: Company) {
  const doc = new jsPDF();
  
  // Colors
  const primaryColor: [number, number, number] = [249, 115, 22]; // Orange
  const getProfileColor = (profile: string): [number, number, number] => {
    const colors = {
      D: [239, 68, 68] as [number, number, number],   // Red
      I: [234, 179, 8] as [number, number, number],   // Yellow
      S: [34, 197, 94] as [number, number, number],   // Green
      C: [59, 130, 246] as [number, number, number],  // Blue
    };
    return colors[profile as keyof typeof colors] || colors.D;
  };

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório DISC', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(company.name, 105, 30, { align: 'center' });

  // Employee Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(test.name, 20, 55);
  
  const profileColor = getProfileColor(test.disc_result.dominant);
  doc.setFillColor(...profileColor);
  doc.roundedRect(150, 48, 40, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.text(`Perfil ${test.disc_result.dominant}`, 170, 55, { align: 'center' });

  // Contact Info
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Email: ${test.email}`, 20, 65);
  if (test.phone) {
    doc.text(`Telefone: ${test.phone}`, 20, 71);
  }
  doc.text(`Cargo: ${test.position}`, 20, test.phone ? 77 : 71);
  doc.text(`Data: ${new Date(test.completed_at).toLocaleDateString('pt-BR')}`, 20, test.phone ? 83 : 77);

  // DISC Scores
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Pontuação DISC', 20, 100);

  const scores = [
    ['Perfil', 'Pontuação', 'Percentual'],
    ['D - Dominância', test.disc_result.scores.D.toString(), `${test.disc_result.percentages.D}%`],
    ['I - Influência', test.disc_result.scores.I.toString(), `${test.disc_result.percentages.I}%`],
    ['S - Estabilidade', test.disc_result.scores.S.toString(), `${test.disc_result.percentages.S}%`],
    ['C - Conformidade', test.disc_result.scores.C.toString(), `${test.disc_result.percentages.C}%`],
  ];

  autoTable(doc, {
    startY: 105,
    head: [scores[0]],
    body: scores.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 50, halign: 'center' },
      2: { cellWidth: 50, halign: 'center' },
    },
  });

  // Profile Description
  const profileDescriptions = {
    D: {
      title: 'Dominância',
      description: 'Perfil direto, orientado a resultados e decisivo. Características: liderança natural, toma decisões rápidas, foco em objetivos.',
    },
    I: {
      title: 'Influência',
      description: 'Perfil comunicativo, entusiasta e persuasivo. Características: excelente comunicador, motiva equipes, criativo.',
    },
    S: {
      title: 'Estabilidade',
      description: 'Perfil paciente, leal e cooperativo. Características: trabalho em equipe, consistente, bom ouvinte.',
    },
    C: {
      title: 'Conformidade',
      description: 'Perfil analítico, preciso e sistemático. Características: alta qualidade, organizado, pensamento crítico.',
    },
  };

  const profile = profileDescriptions[test.disc_result.dominant as keyof typeof profileDescriptions];
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Perfil ${test.disc_result.dominant} - ${profile.title}`, 20, (doc as any).lastAutoTable.finalY + 15);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitDescription = doc.splitTextToSize(profile.description, 170);
  doc.text(splitDescription, 20, (doc as any).lastAutoTable.finalY + 25);

  // AI Analysis
  if (test.ai_analysis) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Análise Personalizada', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitAnalysis = doc.splitTextToSize(test.ai_analysis, 170);
    doc.text(splitAnalysis, 20, 30);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount} | Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  // Save
  doc.save(`relatorio-disc-${test.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

/**
 * Generate CSV export for employee list
 */
export function generateEmployeesCSV(tests: CompanyTest[], company: Company) {
  // CSV Header
  const headers = [
    'Nome',
    'Email',
    'Telefone',
    'Cargo',
    'Departamento',
    'Perfil Dominante',
    'D (%)',
    'I (%)',
    'S (%)',
    'C (%)',
    'Data do Teste',
    'Tentativa',
  ];

  // CSV Rows
  const rows = tests.map(test => [
    test.name,
    test.email,
    test.phone || '',
    test.position,
    test.department || '',
    test.disc_result.dominant,
    test.disc_result.percentages.D,
    test.disc_result.percentages.I,
    test.disc_result.percentages.S,
    test.disc_result.percentages.C,
    new Date(test.completed_at).toLocaleDateString('pt-BR'),
    test.attempt_number,
  ]);

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `funcionarios-${company.slug}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generate consolidated company report PDF
 */
export function generateCompanyReportPDF(
  company: Company,
  tests: CompanyTest[],
  stats: {
    total_tests: number;
    predominant_profile: string;
    avg_d: number;
    avg_i: number;
    avg_s: number;
    avg_c: number;
  }
) {
  const doc = new jsPDF();
  const primaryColor: [number, number, number] = [249, 115, 22];

  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Consolidado', 105, 25, { align: 'center' });
  
  doc.setFontSize(16);
  doc.text(company.name, 105, 38, { align: 'center' });

  // Company Stats
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Estatísticas Gerais', 20, 65);

  const statsData = [
    ['Métrica', 'Valor'],
    ['Total de Testes', stats.total_tests.toString()],
    ['Perfil Predominante', stats.predominant_profile || 'N/A'],
    ['Média D', `${stats.avg_d.toFixed(1)}%`],
    ['Média I', `${stats.avg_i.toFixed(1)}%`],
    ['Média S', `${stats.avg_s.toFixed(1)}%`],
    ['Média C', `${stats.avg_c.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: 70,
    head: [statsData[0]],
    body: statsData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 10 },
  });

  // Profile Distribution
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Distribuição de Perfis', 20, (doc as any).lastAutoTable.finalY + 15);

  const profileCounts = {
    D: tests.filter(t => t.disc_result.dominant === 'D').length,
    I: tests.filter(t => t.disc_result.dominant === 'I').length,
    S: tests.filter(t => t.disc_result.dominant === 'S').length,
    C: tests.filter(t => t.disc_result.dominant === 'C').length,
  };

  const distributionData = [
    ['Perfil', 'Quantidade', 'Percentual'],
    ['Dominância (D)', profileCounts.D.toString(), `${((profileCounts.D / tests.length) * 100).toFixed(1)}%`],
    ['Influência (I)', profileCounts.I.toString(), `${((profileCounts.I / tests.length) * 100).toFixed(1)}%`],
    ['Estabilidade (S)', profileCounts.S.toString(), `${((profileCounts.S / tests.length) * 100).toFixed(1)}%`],
    ['Conformidade (C)', profileCounts.C.toString(), `${((profileCounts.C / tests.length) * 100).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [distributionData[0]],
    body: distributionData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 10 },
  });

  // Top Employees by Profile
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Funcionários por Perfil', 20, 20);

  const employeeData = [
    ['Nome', 'Cargo', 'Perfil', 'Score'],
    ...tests.slice(0, 15).map(test => [
      test.name,
      test.position,
      test.disc_result.dominant,
      `${test.disc_result.percentages[test.disc_result.dominant as 'D' | 'I' | 'S' | 'C']}%`,
    ]),
  ];

  autoTable(doc, {
    startY: 25,
    head: [employeeData[0]],
    body: employeeData.slice(1),
    theme: 'striped',
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 60 },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${pageCount} | Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
      105,
      290,
      { align: 'center' }
    );
  }

  doc.save(`relatorio-consolidado-${company.slug}-${new Date().toISOString().split('T')[0]}.pdf`);
}
