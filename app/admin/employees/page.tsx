/**
 * Employees Page
 * View all employees across all companies
 */

'use client';

import { Users } from 'lucide-react';

export default function EmployeesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          Funcionários
        </h1>
        <p className="text-gray-400">
          Visualização global de todos os funcionários testados
        </p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
        <Users className="mx-auto text-gray-600 mb-4" size={48} />
        <h3 className="text-xl font-bold text-white mb-2">Em Desenvolvimento</h3>
        <p className="text-gray-400 mb-6">
          A visualização global de funcionários será implementada em breve
        </p>
      </div>
    </div>
  );
}
