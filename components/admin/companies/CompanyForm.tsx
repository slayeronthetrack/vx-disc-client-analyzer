/**
 * Company Form Component
 * Reusable form for creating and editing companies
 */

'use client';

import { useState, useEffect } from 'react';
import { Building2, Upload, X, Check } from 'lucide-react';
import type { Company, CreateCompanyInput } from '@/types/company';

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: CreateCompanyInput) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function CompanyForm({ company, onSubmit, onCancel, isEdit = false }: CompanyFormProps) {
  const [formData, setFormData] = useState<CreateCompanyInput>({
    name: company?.name || '',
    slug: company?.slug || '',
    logo_url: company?.logo_url || null,
    primary_color: company?.primary_color || '#F97316',
    secondary_color: company?.secondary_color || null,
    font_family: company?.font_family || 'Inter',
    custom_welcome_message: company?.custom_welcome_message || null,
    background_image_url: company?.background_image_url || null,
    email_template: company?.email_template || null,
    contact_person: company?.contact_person || '',
    contact_email: company?.contact_email || '',
    max_tests: company?.max_tests ?? 100,
    active: company?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugManuallyEdited && formData.name) {
      const generatedSlug = formatSlug(formData.name);
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, slugManuallyEdited]);

  const formatSlug = (input: string): string => {
    return input
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
      .slice(0, 50);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome da empresa é obrigatório';
    }

    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug é obrigatório';
    } else if (formData.slug.length < 3) {
      newErrors.slug = 'Slug deve ter pelo menos 3 caracteres';
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
    }

    if (!formData.contact_person.trim()) {
      newErrors.contact_person = 'Nome do contato é obrigatório';
    }

    if (!formData.contact_email.trim()) {
      newErrors.contact_email = 'Email do contato é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)) {
      newErrors.contact_email = 'Email inválido';
    }

    if (!formData.primary_color || !/^#[0-9A-Fa-f]{6}$/.test(formData.primary_color)) {
      newErrors.primary_color = 'Cor primária inválida (formato: #RRGGBB)';
    }

    if (formData.secondary_color && !/^#[0-9A-Fa-f]{6}$/.test(formData.secondary_color)) {
      newErrors.secondary_color = 'Cor secundária inválida (formato: #RRGGBB)';
    }

    if (formData.max_tests === undefined || formData.max_tests < 0) {
      newErrors.max_tests = 'Limite de testes não pode ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCompanyInput, value: any) => {
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Building2 size={24} />
          Informações Básicas
        </h3>

        <div className="space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome da Empresa *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-900 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
              placeholder="Ex: Acme Corporation"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Slug (URL) *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400">/test/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => {
                  setSlugManuallyEdited(true);
                  handleChange('slug', formatSlug(e.target.value));
                }}
                className={`flex-1 px-4 py-3 bg-gray-900 border ${
                  errors.slug ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
                placeholder="acme-corporation"
              />
            </div>
            {errors.slug && (
              <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Link do teste: {window.location.origin}/test/{formData.slug || 'slug'}
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="w-5 h-5 rounded border-gray-700 bg-gray-900 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-300">
              Empresa ativa (permite novos testes)
            </label>
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Branding
        </h3>

        <div className="space-y-4">
          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL do Logo
            </label>
            <input
              type="url"
              value={formData.logo_url || ''}
              onChange={(e) => handleChange('logo_url', e.target.value || null)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="https://exemplo.com/logo.png"
            />
            {formData.logo_url && (
              <div className="mt-2">
                <img
                  src={formData.logo_url}
                  alt="Logo preview"
                  className="h-16 w-auto rounded-lg border border-gray-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Primary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cor Primária *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className="w-16 h-12 rounded-lg border border-gray-700 bg-gray-900 cursor-pointer"
              />
              <input
                type="text"
                value={formData.primary_color}
                onChange={(e) => handleChange('primary_color', e.target.value)}
                className={`flex-1 px-4 py-3 bg-gray-900 border ${
                  errors.primary_color ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
                placeholder="#F97316"
              />
            </div>
            {errors.primary_color && (
              <p className="mt-1 text-sm text-red-500">{errors.primary_color}</p>
            )}
          </div>

          {/* Secondary Color */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cor Secundária (opcional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.secondary_color || '#FB923C'}
                onChange={(e) => handleChange('secondary_color', e.target.value)}
                className="w-16 h-12 rounded-lg border border-gray-700 bg-gray-900 cursor-pointer"
              />
              <input
                type="text"
                value={formData.secondary_color || ''}
                onChange={(e) => handleChange('secondary_color', e.target.value || null)}
                className={`flex-1 px-4 py-3 bg-gray-900 border ${
                  errors.secondary_color ? 'border-red-500' : 'border-gray-700'
                } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
                placeholder="#FB923C"
              />
            </div>
            {errors.secondary_color && (
              <p className="mt-1 text-sm text-red-500">{errors.secondary_color}</p>
            )}
          </div>

          {/* Font Family */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Fonte
            </label>
            <select
              value={formData.font_family}
              onChange={(e) => handleChange('font_family', e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>

          {/* Custom Welcome Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensagem de Boas-Vindas (opcional)
            </label>
            <textarea
              value={formData.custom_welcome_message || ''}
              onChange={(e) => handleChange('custom_welcome_message', e.target.value || null)}
              rows={3}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              placeholder="Bem-vindo ao teste DISC da nossa empresa..."
            />
            <p className="mt-1 text-sm text-gray-500">
              Máximo 500 caracteres
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Informações de Contato
        </h3>

        <div className="space-y-4">
          {/* Contact Person */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nome do Contato *
            </label>
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => handleChange('contact_person', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-900 border ${
                errors.contact_person ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
              placeholder="João Silva"
            />
            {errors.contact_person && (
              <p className="mt-1 text-sm text-red-500">{errors.contact_person}</p>
            )}
          </div>

          {/* Contact Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email do Contato *
            </label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleChange('contact_email', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-900 border ${
                errors.contact_email ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
              placeholder="joao@empresa.com"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-500">{errors.contact_email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">
          Configurações
        </h3>

        <div className="space-y-4">
          {/* Max Tests */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Limite de Testes
            </label>
            <input
              type="number"
              value={formData.max_tests}
              onChange={(e) => handleChange('max_tests', parseInt(e.target.value) || 0)}
              min="0"
              className={`w-full px-4 py-3 bg-gray-900 border ${
                errors.max_tests ? 'border-red-500' : 'border-gray-700'
              } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500`}
            />
            {errors.max_tests && (
              <p className="mt-1 text-sm text-red-500">{errors.max_tests}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Use 0 para testes ilimitados
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Salvando...
            </>
          ) : (
            <>
              <Check size={20} />
              {isEdit ? 'Atualizar Empresa' : 'Criar Empresa'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
