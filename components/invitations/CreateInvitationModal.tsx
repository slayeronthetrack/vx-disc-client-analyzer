/**
 * Create Invitation Modal
 * Modal for creating single or bulk invitations
 */

'use client';

import { useState } from 'react';
import { X, Plus, Trash2, Upload } from 'lucide-react';

interface CreateInvitationModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateInvitationModal({ onClose, onSuccess }: CreateInvitationModalProps) {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Single invitation state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');

  // Bulk invitation state
  const [bulkInvitations, setBulkInvitations] = useState([
    { name: '', email: '', position: '', department: '' }
  ]);

  const handleAddRow = () => {
    setBulkInvitations([...bulkInvitations, { name: '', email: '', position: '', department: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    setBulkInvitations(bulkInvitations.filter((_, i) => i !== index));
  };

  const handleBulkChange = (index: number, field: string, value: string) => {
    const updated = [...bulkInvitations];
    updated[index] = { ...updated[index], [field]: value };
    setBulkInvitations(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const body = mode === 'single'
        ? { employee_name: name, employee_email: email, employee_position: position, employee_department: department }
        : { invitations: bulkInvitations.filter(inv => inv.name && inv.email), send_immediately: false };

      const response = await fetch('/api/company/dashboard/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invitation');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Criar Convite</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'single'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              Convite Único
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'bulk'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              Múltiplos Convites
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {mode === 'single' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cargo</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Departamento</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bulkInvitations.map((inv, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <input
                    type="text"
                    placeholder="Nome *"
                    value={inv.name}
                    onChange={(e) => handleBulkChange(index, 'name', e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="email"
                    placeholder="Email *"
                    value={inv.email}
                    onChange={(e) => handleBulkChange(index, 'email', e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                  <input
                    type="text"
                    placeholder="Cargo"
                    value={inv.position}
                    onChange={(e) => handleBulkChange(index, 'position', e.target.value)}
                    className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  />
                  {bulkInvitations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(index)}
                      className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 px-4 py-2 text-orange-500 hover:bg-orange-500/20 rounded-lg transition-colors"
              >
                <Plus size={20} />
                Adicionar Linha
              </button>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            {loading ? 'Criando...' : 'Criar Convite(s)'}
          </button>
        </div>
      </div>
    </div>
  );
}
