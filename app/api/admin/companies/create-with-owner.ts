/**
 * Admin API: Create Company with Owner
 * POST /api/admin/companies/create-with-owner
 * 
 * Cria uma empresa com seu dono (company_admin)
 * - Requer autenticação como admin/super_admin
 * - Cria empresa no banco de dados
 * - Cria usuário no Supabase Auth
 * - Vincula usuário à empresa como company_admin
 * 
 * SEGURANÇA: Sempre valida no backend usando o usuário autenticado
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface CreateCompanyWithOwnerRequest {
  // Dados da empresa
  company_name: string;
  company_slug?: string;
  company_email?: string;
  company_phone?: string;
  max_tests?: number;
  active?: boolean;

  // Dados do dono/proprietário
  owner_name: string;
  owner_email: string;
  owner_password: string;
}

interface CreateCompanyWithOwnerResponse {
  success: boolean;
  message: string;
  data?: {
    company_id: string;
    company_name: string;
    company_slug: string;
    owner_id: string;
    owner_email: string;
    owner_temporary_password?: string;
  };
  error?: string;
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateCompanyWithOwnerResponse>> {
  try {
    // 1. Criar cliente Supabase do servidor
    const supabase = await createClient();

    // 2. Obter usuário autenticado
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !currentUser) {
      console.log('[CreateCompanyWithOwner] Unauthorized - no authenticated user');
      return NextResponse.json(
        {
          success: false,
          message: 'Não autenticado',
          error: 'Você precisa estar logado para criar uma empresa',
        },
        { status: 401 }
      );
    }

    // 3. Verificar se o usuário é admin ou super_admin
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', currentUser.id)
      .single();

    if (profileError || !currentUserProfile) {
      console.log('[CreateCompanyWithOwner] User profile not found');
      return NextResponse.json(
        {
          success: false,
          message: 'Perfil do usuário não encontrado',
          error: 'Não foi possível encontrar seu perfil',
        },
        { status: 403 }
      );
    }

    const currentUserRole = currentUserProfile.role as string;

    if (currentUserRole !== 'admin' && currentUserRole !== 'super_admin') {
      console.log('[CreateCompanyWithOwner] Forbidden - insufficient role:', currentUserRole);
      return NextResponse.json(
        {
          success: false,
          message: 'Acesso negado',
          error: 'Apenas admins podem criar empresas',
        },
        { status: 403 }
      );
    }

    // 4. Validar e parsear request
    const body: CreateCompanyWithOwnerRequest = await request.json();

    // Validações básicas
    if (!body.company_name || !body.company_name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validação falhou',
          error: 'Nome da empresa é obrigatório',
        },
        { status: 400 }
      );
    }

    if (!body.owner_name || !body.owner_name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validação falhou',
          error: 'Nome do proprietário é obrigatório',
        },
        { status: 400 }
      );
    }

    if (!body.owner_email || !body.owner_email.trim() || !body.owner_email.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validação falhou',
          error: 'E-mail válido do proprietário é obrigatório',
        },
        { status: 400 }
      );
    }

    if (!body.owner_password || body.owner_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validação falhou',
          error: 'Senha deve ter pelo menos 6 caracteres',
        },
        { status: 400 }
      );
    }

    // Gerar slug da empresa
    const companySlug = body.company_slug?.trim() || 
      body.company_name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

    console.log('[CreateCompanyWithOwner] Starting company creation', {
      companyName: body.company_name,
      companySlug,
      ownerEmail: body.owner_email,
      adminUser: currentUser.id,
    });

    // 5. Verificar se slug já existe
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', companySlug)
      .single();

    if (existingCompany) {
      console.log('[CreateCompanyWithOwner] Slug already exists:', companySlug);
      return NextResponse.json(
        {
          success: false,
          message: 'Validação falhou',
          error: 'Este slug de empresa já existe',
        },
        { status: 400 }
      );
    }

    // 6. Criar empresa no banco de dados
    console.log('[CreateCompanyWithOwner] Creating company...');
    const { data: newCompany, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: body.company_name.trim(),
        slug: companySlug,
        email: body.company_email?.trim() || null,
        phone: body.company_phone?.trim() || null,
        max_tests: body.max_tests || 100,
        active: body.active !== false,
        created_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (companyError || !newCompany) {
      console.error('[CreateCompanyWithOwner] Error creating company:', companyError);
      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao criar empresa',
          error: companyError?.message || 'Falha ao criar registro da empresa',
        },
        { status: 500 }
      );
    }

    const companyId = newCompany.id;
    console.log('[CreateCompanyWithOwner] Company created:', { companyId, companySlug });

    // 7. Criar usuário no Supabase Auth
    console.log('[CreateCompanyWithOwner] Creating auth user...');
    
    // NOTA: Para criar usuários, seria necessário usar a Supabase Admin API
    // Por enquanto, estamos usando a API padrão que não permite criar usuários
    // Alternativa: Usar a URL da admin API com SERVICE_ROLE_KEY
    
    // Criar usuário usando o admin service role
    const adminSupabase = createAdminClient();
    
    const { data: authUser, error: authCreateError } = await adminSupabase.auth.admin.createUser({
      email: body.owner_email.trim(),
      password: body.owner_password,
      email_confirm: true, // Auto-confirmar e-mail
    });

    if (authCreateError || !authUser) {
      console.error('[CreateCompanyWithOwner] Error creating auth user:', authCreateError);
      
      // Tentar remover a empresa criada
      await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao criar usuário de autenticação',
          error: authCreateError?.message || 'Falha ao criar usuário',
        },
        { status: 500 }
      );
    }

    const ownerId = authUser.user?.id;
    console.log('[CreateCompanyWithOwner] Auth user created:', { ownerId });

    // 8. Criar perfil do dono da empresa
    console.log('[CreateCompanyWithOwner] Creating owner profile...');
    const { error: profileCreateError } = await supabase
      .from('profiles')
      .insert({
        user_id: ownerId,
        full_name: body.owner_name.trim(),
        role: 'company_admin',
        company_id: companyId,
        profile_completed: true, // Marcar como completo pois é criado pelo admin
      });

    if (profileCreateError) {
      console.error('[CreateCompanyWithOwner] Error creating owner profile:', profileCreateError);
      
      // Tentar limpar: remover usuário e empresa
      await adminSupabase.auth.admin.deleteUser(ownerId!);
      await supabase
        .from('companies')
        .delete()
        .eq('id', companyId);

      return NextResponse.json(
        {
          success: false,
          message: 'Erro ao criar perfil do proprietário',
          error: profileCreateError.message || 'Falha ao criar perfil',
        },
        { status: 500 }
      );
    }

    console.log('[CreateCompanyWithOwner] Success - Company and owner created', {
      companyId,
      companySlug,
      ownerId,
    });

    // 9. Retornar sucesso
    return NextResponse.json({
      success: true,
      message: 'Empresa e proprietário criados com sucesso',
      data: {
        company_id: companyId,
        company_name: body.company_name.trim(),
        company_slug: companySlug,
        owner_id: ownerId!,
        owner_email: body.owner_email.trim(),
        owner_temporary_password: body.owner_password, // Mostrar apenas uma vez
      },
    });

  } catch (error: any) {
    console.error('[CreateCompanyWithOwner] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erro interno do servidor',
        error: error?.message || 'Ocorreu um erro inesperado',
      },
      { status: 500 }
    );
  }
}

/**
 * Criar cliente admin do Supabase
 * IMPORTANTE: Isso usa a SERVICE_ROLE_KEY que deve NUNCA ser exposada ao cliente
 */
function createAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase credentials for admin operations');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
