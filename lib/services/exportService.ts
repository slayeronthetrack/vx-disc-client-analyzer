/**
 * Export Service
 * Business logic for exporting company test data to CSV and PDF formats
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { CompanyTest, CompanyTestFilters } from '@/types/company-test';
import { getCompanyTests } from './companyTestService';
import { getCompanyById } from './companyService';

/**
 * Generate CSV export of company test data
 */
export async function generateCSVExport(
  companyId: string,
  filters: CompanyTestFilters | undefined,
  supabase: SupabaseClient
): Promise<string> {
  // Fetch all tests with filters (no pagination limit for export)
  const exportFilters = {
    ...filters,
    page: 1,
    limit: 10000, // Large limit to get all records
  };

  const { tests } = await getCompanyTests(companyId, exportFilters, supabase);

  // CSV header
  const headers = [
    'Name',
    'Email',
    'Position',
    'Department',
    'Dominant Profile',
    'Secondary Profile',
    'D Score',
    'I Score',
    'S Score',
    'C Score',
    'D Percentage',
    'I Percentage',
    'S Percentage',
    'C Percentage',
    'Test Date',
    'Attempt Number',
    'Status',
  ];

  // CSV rows
  const rows = tests.map(test => [
    escapeCSV(test.name),
    escapeCSV(test.email),
    escapeCSV(test.position),
    escapeCSV(test.department || ''),
    test.disc_result.dominant,
    test.disc_result.secondary,
    test.disc_result.scores.D.toString(),
    test.disc_result.scores.I.toString(),
    test.disc_result.scores.S.toString(),
    test.disc_result.scores.C.toString(),
    test.disc_result.percentages.D.toFixed(1),
    test.disc_result.percentages.I.toFixed(1),
    test.disc_result.percentages.S.toFixed(1),
    test.disc_result.percentages.C.toFixed(1),
    new Date(test.completed_at).toLocaleDateString('pt-BR'),
    test.attempt_number.toString(),
    test.status,
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Generate PDF export of company test data
 */
export async function generatePDFExport(
  companyId: string,
  filters: CompanyTestFilters | undefined,
  supabase: SupabaseClient
): Promise<Buffer> {
  // Fetch company info
  const company = await getCompanyById(companyId, supabase);
  if (!company) {
    throw new Error('Company not found');
  }

  // Fetch all tests with filters (no pagination limit for export)
  const exportFilters = {
    ...filters,
    page: 1,
    limit: 10000, // Large limit to get all records
  };

  const { tests } = await getCompanyTests(companyId, exportFilters, supabase);

  // Calculate summary statistics
  const totalTests = tests.length;
  const uniqueEmployees = new Set(tests.map(t => t.employee_id)).size;
  
  const discDistribution = {
    D: tests.filter(t => t.disc_result.dominant === 'D').length,
    I: tests.filter(t => t.disc_result.dominant === 'I').length,
    S: tests.filter(t => t.disc_result.dominant === 'S').length,
    C: tests.filter(t => t.disc_result.dominant === 'C').length,
  };

  const avgScores = {
    D: tests.reduce((sum, t) => sum + t.disc_result.scores.D, 0) / totalTests || 0,
    I: tests.reduce((sum, t) => sum + t.disc_result.scores.I, 0) / totalTests || 0,
    S: tests.reduce((sum, t) => sum + t.disc_result.scores.S, 0) / totalTests || 0,
    C: tests.reduce((sum, t) => sum + t.disc_result.scores.C, 0) / totalTests || 0,
  };

  // Import jsPDF dynamically (only when needed)
  const { default: jsPDF } = await import('jspdf');
  await import('jspdf-autotable');

  // Create PDF
  const doc = new jsPDF();
  
  // Add company header
  doc.setFontSize(20);
  doc.setTextColor(249, 115, 22); // Orange color
  doc.text(company.name, 14, 20);
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`DISC Test Report`, 14, 28);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString('pt-BR')}`, 14, 34);

  // Add summary statistics
  doc.setFontSize(14);
  doc.text('Summary Statistics', 14, 45);
  
  doc.setFontSize(10);
  let yPos = 52;
  doc.text(`Total Tests: ${totalTests}`, 14, yPos);
  yPos += 6;
  doc.text(`Unique Employees: ${uniqueEmployees}`, 14, yPos);
  yPos += 6;
  doc.text(`Average Scores: D=${avgScores.D.toFixed(1)} I=${avgScores.I.toFixed(1)} S=${avgScores.S.toFixed(1)} C=${avgScores.C.toFixed(1)}`, 14, yPos);
  yPos += 10;

  // Add DISC distribution
  doc.setFontSize(14);
  doc.text('DISC Distribution', 14, yPos);
  yPos += 7;
  
  doc.setFontSize(10);
  doc.text(`D (Dominance): ${discDistribution.D} (${((discDistribution.D / totalTests) * 100).toFixed(1)}%)`, 14, yPos);
  yPos += 6;
  doc.text(`I (Influence): ${discDistribution.I} (${((discDistribution.I / totalTests) * 100).toFixed(1)}%)`, 14, yPos);
  yPos += 6;
  doc.text(`S (Steadiness): ${discDistribution.S} (${((discDistribution.S / totalTests) * 100).toFixed(1)}%)`, 14, yPos);
  yPos += 6;
  doc.text(`C (Compliance): ${discDistribution.C} (${((discDistribution.C / totalTests) * 100).toFixed(1)}%)`, 14, yPos);
  yPos += 10;

  // Add employee table
  doc.setFontSize(14);
  doc.text('Employee Test Results', 14, yPos);
  yPos += 5;

  // Prepare table data
  const tableData = tests.map(test => [
    test.name,
    test.position,
    test.department || '-',
    test.disc_result.dominant,
    `${test.disc_result.scores.D}/${test.disc_result.scores.I}/${test.disc_result.scores.S}/${test.disc_result.scores.C}`,
    new Date(test.completed_at).toLocaleDateString('pt-BR'),
  ]);

  // Add table using autoTable
  (doc as any).autoTable({
    startY: yPos,
    head: [['Name', 'Position', 'Department', 'Profile', 'DISC Scores', 'Date']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] }, // Orange header
    styles: { fontSize: 8 },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 25 },
      3: { cellWidth: 15 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25 },
    },
  });

  // Return PDF as buffer
  return Buffer.from(doc.output('arraybuffer'));
}

/**
 * Escape CSV field (handle commas, quotes, newlines)
 */
function escapeCSV(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(
  companySlug: string,
  format: 'csv' | 'pdf'
): string {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `${companySlug}-disc-report-${date}.${format}`;
}
