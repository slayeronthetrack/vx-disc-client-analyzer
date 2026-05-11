/**
 * Admin Management Page (Super Admin Only)
 * Manage admin access - grant or revoke admin role by email
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Mail, UserPlus, UserMinus, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';

interface AdminUser {
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export default function AdminManagementPage() {
  const router = useRouter();
  const { profile, loading: authLoading } = useAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [action, setAction] = useState<'grant' | 'revoke'>('grant');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect if not super_admin
  useEffect(() => {
    if (!authLoading && profile?.role !== 'super_admin') {
      router.push('/admin');
    }
  }, [profile, authLoading, router]);

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      loadAdmins();
    }
  }, [profile]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');
      const response = await apiGet('/api/admin/users');
      
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error loading admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Por favor, insira um email válido' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const { apiPost } = await import('@/lib/utils/apiClient');
      const response = await apiPost('/api/admin/users/manage', {
        email: email.trim().toLowerCase(),
        action,
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ 
          type: 'success', 
          text: action === 'grant' 
            ? `Acesso admin concedido para ${email}` 
            : `Acesso admin removido de ${email}`
        });
        setEmail('');
        loadAdmins();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Erro ao processar solicitação' });
      }
    } catch (error) {
      console.error('Error managing admin:', error);
      setMessage({ type: 'error', text: 'Erro ao processar solicitação' });
    } finally {
      setProcessing(false);
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return <Loading />;
  }

  if (profile?.role !== 'super_admin') {
    return null;
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <Shield className="text-orange-500" size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white">
              Gerenciar Admins
            </h1>
            <p className="text-gray-400">
              Conceder ou remover acesso administrativo por email
            </p>
          </div>
        </div>
      </div>

      {/* Grant/Revoke Form */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">Gerenciar Acesso</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Email Input */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email do Usuário
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@exemplo.com"
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                  required
                />
              </div>
            </div>

            {/* Action Select */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Ação
              </label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as 'grant' | 'revoke')}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              >
                <option value="grant">Conceder Admin</option>
                <option value="revoke">Remover Admin</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing}
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors
              ${action === 'grant'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {processing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </>
            ) : (
              <>
                {action === 'grant' ? <UserPlus size={20} /> : <UserMinus size={20} />}
                {action === 'grant' ? 'Conceder Acesso' : 'Remover Acesso'}
              </>
            )}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div className={`
            mt-4 flex items-center gap-2 p-4 rounded-lg border
            ${message.type === 'success'
              ? 'bg-green-500/10 border-green-500/30 text-green-500'
              : 'bg-red-500/10 border-red-500/30 text-red-500'
            }
          `}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Current Admins List */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            Admins Atuais ({filteredAdmins.length})
          </h2>
          
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-sm"
            />
          </div>
        </div>

        {filteredAdmins.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? 'Nenhum admin encontrado' : 'Nenhum admin cadastrado'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAdmins.map((admin) => (
              <div
                key={admin.user_id}
                className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-orange-500 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    p-2 rounded-lg border
                    ${admin.role === 'super_admin'
                      ? 'bg-orange-500/10 border-orange-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                    }
                  `}>
                    <Shield 
                      className={admin.role === 'super_admin' ? 'text-orange-500' : 'text-blue-500'} 
                      size={20} 
                    />
                  </div>
                  <div>
                    <p className="text-white font-medium">{admin.email}</p>
                    <p className="text-sm text-gray-400">
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                </div>
                <div className="text-sm text-gray-400">
                  Desde {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
