/**
 * Company Profile Form Component
 * Form for editing company profile information
 */

'use client';

import { useState } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Company } from '@/types/company';

interface CompanyProfileFormProps {
  company: Company;
  onUpdate: (data: Partial<Company>) => Promise<void>;
}

export function CompanyProfileForm({ company, onUpdate }: CompanyProfileFormProps) {
  const [formData, setFormData] = useState({
    contact_email: company.contact_email || '',
    contact_phone: company.contact_phone || '',
    address: company.address || '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.contact_email && !validateEmail(formData.contact_email)) {
      newErrors.contact_email = 'Email inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await onUpdate(formData);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Falha ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Read-only Company Info */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informações da Empresa (Somente Leitura)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={company.name}
              disabled
              className="w-full px-4 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Slug (URL)
            </label>
            <input
              type="text"
              value={company.slug}
              disabled
              className="w-full px-4 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Limite de Testes
            </label>
            <input
              type="number"
              value={company.max_tests}
              disabled
              className="w-full px-4 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Status
            </label>
            <input
              type="text"
              value={company.active ? 'Ativo' : 'Inativo'}
              disabled
              className="w-full px-4 py-2 bg-gray-700/30 border border-gray-600 rounded-lg text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-4">
          Para alterar essas informações, entre em contato com um super administrador.
        </p>
      </div>

      {/* Editable Contact Info */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Informações de Contato (Editável)</h3>

        <div className="space-y-4">
          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-gray-300 mb-2">
              Email de Contato
            </label>
            <input
              type="email"
              id="contact_email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              className={`w-full px-4 py-2 bg-gray-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors ${
                errors.contact_email ? 'border-red-500' : 'border-gray-600'
              }`}
              placeholder="contato@empresa.com"
            />
            {errors.contact_email && (
              <p className="text-red-500 text-sm mt-1">{errors.contact_email}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-300 mb-2">
              Telefone de Contato <span className="text-gray-500">(Opcional)</span>
            </label>
            <input
              type="tel"
              id="contact_phone"
              value={formData.contact_phone}
              onChange={(e) => handleChange('contact_phone', e.target.value)}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
              Endereço <span className="text-gray-500">(Opcional)</span>
            </label>
            <textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors resize-none"
              placeholder="Rua, número, bairro, cidade, estado"
            />
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-500" size={20} />
          <p className="text-green-500">Perfil atualizado com sucesso!</p>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={20} />
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save size={20} />
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </form>
  );
}
