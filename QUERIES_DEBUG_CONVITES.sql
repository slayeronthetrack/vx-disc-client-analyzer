-- 🔍 Queries de Debug - Sistema de Convites
-- Use estas queries para validar o funcionamento do sistema

-- ============================================
-- 1. VERIFICAR TODOS OS CONVITES
-- ============================================
SELECT 
  id,
  employee_name,
  employee_email,
  employee_position,
  employee_department,
  status,
  invitation_token,
  test_id,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(sent_at, 'DD/MM/YYYY HH24:MI') as enviado_em,
  TO_CHAR(opened_at, 'DD/MM/YYYY HH24:MI') as aberto_em,
  TO_CHAR(started_at, 'DD/MM/YYYY HH24:MI') as iniciado_em,
  TO_CHAR(completed_at, 'DD/MM/YYYY HH24:MI') as completado_em,
  TO_CHAR(expires_at, 'DD/MM/YYYY HH24:MI') as expira_em
FROM test_invitations
ORDER BY created_at DESC;

-- ============================================
-- 2. VERIFICAR CONVITE ESPECÍFICO POR EMAIL
-- ============================================
SELECT 
  id,
  employee_name,
  employee_email,
  status,
  invitation_token,
  test_id,
  created_at,
  sent_at,
  opened_at,
  started_at,
  completed_at,
  expires_at
FROM test_invitations 
WHERE employee_email = 'joao.teste@email.com'
ORDER BY created_at DESC 
LIMIT 1;

-- ============================================
-- 3. VERIFICAR TESTE VINCULADO AO CONVITE
-- ============================================
SELECT 
  ct.id,
  ct.invitation_id,
  ct.name,
  ct.email,
  ct.position,
  ct.department,
  ct.disc_result->>'dominant' as perfil_dominante,
  ct.disc_result->'scores' as scores,
  ct.status,
  TO_CHAR(ct.created_at, 'DD/MM/YYYY HH24:MI') as criado_em,
  TO_CHAR(ct.completed_at, 'DD/MM/YYYY HH24:MI') as completado_em
FROM company_tests ct
WHERE ct.email = 'joao.teste@email.com'
ORDER BY ct.created_at DESC 
LIMIT 1;

-- ============================================
-- 4. VERIFICAR VINCULAÇÃO BIDIRECIONAL
-- ============================================
SELECT 
  ti.id as invitation_id,
  ti.employee_name,
  ti.employee_email,
  ti.status as invitation_status,
  ti.test_id as test_id_from_invitation,
  ct.id as test_id_from_test,
  ct.invitation_id as invitation_id_from_test,
  CASE 
    WHEN ti.test_id = ct.id AND ct.invitation_id = ti.id 
    THEN '✅ VINCULAÇÃO OK' 
    ELSE '❌ ERRO NA VINCULAÇÃO' 
  END as status_vinculacao,
  CASE 
    WHEN ti.test_id IS NULL THEN '⚠️ Convite sem teste vinculado'
    WHEN ct.id IS NULL THEN '❌ Teste não encontrado'
    WHEN ti.test_id != ct.id THEN '❌ IDs não correspondem'
    WHEN ct.invitation_id != ti.id THEN '❌ Invitation_id não corresponde'
    ELSE '✅ Tudo OK'
  END as diagnostico
FROM test_invitations ti
LEFT JOIN company_tests ct ON ti.test_id = ct.id
WHERE ti.employee_email = 'joao.teste@email.com'
ORDER BY ti.created_at DESC;

-- ============================================
-- 5. ESTATÍSTICAS DE CONVITES POR STATUS
-- ============================================
SELECT 
  status,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM test_invitations
GROUP BY status
ORDER BY quantidade DESC;

-- ============================================
-- 6. CONVITES POR EMPRESA
-- ============================================
SELECT 
  c.name as empresa,
  COUNT(ti.id) as total_convites,
  COUNT(CASE WHEN ti.status = 'pending' THEN 1 END) as pendentes,
  COUNT(CASE WHEN ti.status = 'sent' THEN 1 END) as enviados,
  COUNT(CASE WHEN ti.status = 'opened' THEN 1 END) as abertos,
  COUNT(CASE WHEN ti.status = 'started' THEN 1 END) as iniciados,
  COUNT(CASE WHEN ti.status = 'completed' THEN 1 END) as completados,
  COUNT(CASE WHEN ti.status = 'expired' THEN 1 END) as expirados,
  ROUND(
    COUNT(CASE WHEN ti.status = 'completed' THEN 1 END) * 100.0 / 
    NULLIF(COUNT(CASE WHEN ti.status IN ('sent', 'opened', 'started', 'completed') THEN 1 END), 0),
    2
  ) as taxa_conclusao
FROM companies c
LEFT JOIN test_invitations ti ON c.id = ti.company_id
GROUP BY c.id, c.name
ORDER BY total_convites DESC;

-- ============================================
-- 7. TEMPO MÉDIO ENTRE ETAPAS
-- ============================================
SELECT 
  AVG(EXTRACT(EPOCH FROM (opened_at - sent_at)) / 60) as minutos_envio_abertura,
  AVG(EXTRACT(EPOCH FROM (started_at - opened_at)) / 60) as minutos_abertura_inicio,
  AVG(EXTRACT(EPOCH FROM (completed_at - started_at)) / 60) as minutos_inicio_conclusao,
  AVG(EXTRACT(EPOCH FROM (completed_at - sent_at)) / 60) as minutos_total
FROM test_invitations
WHERE status = 'completed';

-- ============================================
-- 8. CONVITES PRÓXIMOS DE EXPIRAR (7 dias)
-- ============================================
SELECT 
  id,
  employee_name,
  employee_email,
  status,
  TO_CHAR(expires_at, 'DD/MM/YYYY HH24:MI') as expira_em,
  EXTRACT(DAY FROM (expires_at - NOW())) as dias_restantes
FROM test_invitations
WHERE status NOT IN ('completed', 'expired')
  AND expires_at < NOW() + INTERVAL '7 days'
ORDER BY expires_at ASC;

-- ============================================
-- 9. CONVITES EXPIRADOS NÃO MARCADOS
-- ============================================
SELECT 
  id,
  employee_name,
  employee_email,
  status,
  TO_CHAR(expires_at, 'DD/MM/YYYY HH24:MI') as expirou_em
FROM test_invitations
WHERE status != 'expired'
  AND expires_at < NOW()
ORDER BY expires_at DESC;

-- ============================================
-- 10. ATUALIZAR CONVITES EXPIRADOS (MANUTENÇÃO)
-- ============================================
-- USE COM CUIDADO! Isso atualiza o status de convites expirados
/*
UPDATE test_invitations
SET status = 'expired'
WHERE status NOT IN ('completed', 'expired')
  AND expires_at < NOW();
*/

-- ============================================
-- 11. CONVITES SEM VINCULAÇÃO (POSSÍVEIS ERROS)
-- ============================================
SELECT 
  ti.id,
  ti.employee_name,
  ti.employee_email,
  ti.status,
  ti.test_id,
  CASE 
    WHEN ti.status = 'completed' AND ti.test_id IS NULL 
    THEN '❌ ERRO: Completado sem test_id'
    WHEN ti.test_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM company_tests WHERE id = ti.test_id
    )
    THEN '❌ ERRO: test_id aponta para teste inexistente'
    ELSE '✅ OK'
  END as diagnostico
FROM test_invitations ti
WHERE (ti.status = 'completed' AND ti.test_id IS NULL)
   OR (ti.test_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM company_tests WHERE id = ti.test_id
   ));

-- ============================================
-- 12. TESTES SEM VINCULAÇÃO COM CONVITE
-- ============================================
SELECT 
  ct.id,
  ct.name,
  ct.email,
  ct.invitation_id,
  CASE 
    WHEN ct.invitation_id IS NULL 
    THEN '✅ Teste direto (sem convite)'
    WHEN NOT EXISTS (
      SELECT 1 FROM test_invitations WHERE id = ct.invitation_id
    )
    THEN '❌ ERRO: invitation_id aponta para convite inexistente'
    ELSE '✅ OK'
  END as diagnostico
FROM company_tests ct
WHERE ct.invitation_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM test_invitations WHERE id = ct.invitation_id
  );

-- ============================================
-- 13. HISTÓRICO DE MUDANÇAS DE STATUS
-- ============================================
-- Esta query mostra a progressão de status de cada convite
SELECT 
  id,
  employee_name,
  employee_email,
  status as status_atual,
  CASE WHEN created_at IS NOT NULL THEN '✅' ELSE '❌' END as criado,
  CASE WHEN sent_at IS NOT NULL THEN '✅' ELSE '⏳' END as enviado,
  CASE WHEN opened_at IS NOT NULL THEN '✅' ELSE '⏳' END as aberto,
  CASE WHEN started_at IS NOT NULL THEN '✅' ELSE '⏳' END as iniciado,
  CASE WHEN completed_at IS NOT NULL THEN '✅' ELSE '⏳' END as completado,
  TO_CHAR(created_at, 'DD/MM HH24:MI') as criado_em,
  TO_CHAR(sent_at, 'DD/MM HH24:MI') as enviado_em,
  TO_CHAR(opened_at, 'DD/MM HH24:MI') as aberto_em,
  TO_CHAR(started_at, 'DD/MM HH24:MI') as iniciado_em,
  TO_CHAR(completed_at, 'DD/MM HH24:MI') as completado_em
FROM test_invitations
ORDER BY created_at DESC;

-- ============================================
-- 14. PERFORMANCE: CONVITES MAIS RÁPIDOS
-- ============================================
SELECT 
  employee_name,
  employee_email,
  EXTRACT(EPOCH FROM (completed_at - sent_at)) / 60 as minutos_total,
  TO_CHAR(sent_at, 'DD/MM/YYYY HH24:MI') as enviado_em,
  TO_CHAR(completed_at, 'DD/MM/YYYY HH24:MI') as completado_em
FROM test_invitations
WHERE status = 'completed'
ORDER BY (completed_at - sent_at) ASC
LIMIT 10;

-- ============================================
-- 15. LIMPAR DADOS DE TESTE (CUIDADO!)
-- ============================================
-- USE APENAS EM DESENVOLVIMENTO!
-- Isso remove TODOS os convites e testes de teste
/*
-- Deletar testes de teste
DELETE FROM company_tests 
WHERE email LIKE '%@test.com' 
   OR email LIKE '%@teste.com'
   OR email LIKE '%@example.com';

-- Deletar convites de teste
DELETE FROM test_invitations 
WHERE employee_email LIKE '%@test.com' 
   OR employee_email LIKE '%@teste.com'
   OR employee_email LIKE '%@example.com';
*/

-- ============================================
-- 16. CRIAR CONVITE DE TESTE MANUALMENTE
-- ============================================
-- Use isso se precisar criar um convite direto no banco
/*
INSERT INTO test_invitations (
  company_id,
  employee_name,
  employee_email,
  employee_position,
  employee_department,
  invitation_token,
  status,
  expires_at,
  sent_by
) VALUES (
  'SEU_COMPANY_ID_AQUI',
  'João Silva Teste',
  'joao.teste@email.com',
  'Analista de Vendas',
  'Comercial',
  encode(gen_random_bytes(32), 'hex'), -- Gera token aleatório
  'pending',
  NOW() + INTERVAL '30 days',
  'ADMIN_USER_ID_AQUI'
);
*/

-- ============================================
-- 17. VERIFICAR INTEGRIDADE DO SISTEMA
-- ============================================
-- Esta query faz uma verificação completa
SELECT 
  'Total de Convites' as metrica,
  COUNT(*)::text as valor
FROM test_invitations
UNION ALL
SELECT 
  'Convites Completados',
  COUNT(*)::text
FROM test_invitations
WHERE status = 'completed'
UNION ALL
SELECT 
  'Convites com test_id NULL (completados)',
  COUNT(*)::text
FROM test_invitations
WHERE status = 'completed' AND test_id IS NULL
UNION ALL
SELECT 
  'Testes com invitation_id',
  COUNT(*)::text
FROM company_tests
WHERE invitation_id IS NOT NULL
UNION ALL
SELECT 
  'Vinculações Quebradas',
  COUNT(*)::text
FROM test_invitations ti
LEFT JOIN company_tests ct ON ti.test_id = ct.id
WHERE ti.status = 'completed' 
  AND (ti.test_id IS NULL OR ct.id IS NULL OR ct.invitation_id != ti.id);

-- ============================================
-- 18. BUSCAR CONVITE POR TOKEN
-- ============================================
-- Útil para debug quando você tem um token específico
/*
SELECT 
  id,
  employee_name,
  employee_email,
  status,
  test_id,
  TO_CHAR(expires_at, 'DD/MM/YYYY HH24:MI') as expira_em,
  CASE 
    WHEN expires_at < NOW() THEN '❌ EXPIRADO'
    ELSE '✅ VÁLIDO'
  END as validade
FROM test_invitations
WHERE invitation_token = 'SEU_TOKEN_AQUI';
*/

-- ============================================
-- 19. CONVITES POR DEPARTAMENTO
-- ============================================
SELECT 
  COALESCE(employee_department, 'Sem Departamento') as departamento,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completados,
  ROUND(
    COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0 / COUNT(*),
    2
  ) as taxa_conclusao
FROM test_invitations
GROUP BY employee_department
ORDER BY total DESC;

-- ============================================
-- 20. ÚLTIMOS 10 CONVITES CRIADOS
-- ============================================
SELECT 
  id,
  employee_name,
  employee_email,
  status,
  TO_CHAR(created_at, 'DD/MM/YYYY HH24:MI:SS') as criado_em,
  EXTRACT(HOUR FROM (NOW() - created_at)) as horas_atras
FROM test_invitations
ORDER BY created_at DESC
LIMIT 10;
