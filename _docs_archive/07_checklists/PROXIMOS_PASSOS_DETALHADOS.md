# Próximos Passos Detalhados - Perfil Integrado

## 🎯 OBJETIVO
Completar a implementação do Perfil Integrado (DISC + Valores + Tipos Psicológicos) no frontend e APIs.

---

## PASSO 1: APLICAR MIGRATION NO SUPABASE ⚠️

### Prioridade: CRÍTICA
### Tempo estimado: 2 minutos

### Como fazer:
1. Acesse: https://eolvvdmzeifbeugkhkyg.supabase.co
2. Faça login
3. Vá em: **SQL Editor** (menu lateral esquerdo)
4. Clique em: **New Query**
5. Cole o SQL abaixo:

```sql
-- Add Integrated Profile Fields
ALTER TABLE disc_tests
ADD COLUMN IF NOT EXISTS value_scores JSONB,
ADD COLUMN IF NOT EXISTS dominant_values TEXT[],
ADD COLUMN IF NOT EXISTS value_percentages JSONB,
ADD COLUMN IF NOT EXISTS psychological_scores JSONB,
ADD COLUMN IF NOT EXISTS psychological_profile JSONB,
ADD COLUMN IF NOT EXISTS integrated_analysis TEXT;

-- Create GIN indexes for performance
CREATE INDEX IF NOT EXISTS idx_disc_tests_value_scores 
  ON disc_tests USING GIN (value_scores);
CREATE INDEX IF NOT EXISTS idx_disc_tests_psychological_scores 
  ON disc_tests USING GIN (psychological_scores);
CREATE INDEX IF NOT EXISTS idx_disc_tests_psychological_profile 
  ON disc_tests USING GIN (psychological_profile);

-- Add comments
COMMENT ON COLUMN disc_tests.value_scores IS 'Scores da Teoria dos Valores (theoretical, economic, aesthetic, social, political, spiritual)';
COMMENT ON COLUMN disc_tests.dominant_values IS 'Array com valores dominantes do usuário';
COMMENT ON COLUMN disc_tests.value_percentages IS 'Percentagens de cada valor';
COMMENT ON COLUMN disc_tests.psychological_scores IS 'Scores dos eixos psicológicos (energy, perception, decision, organization)';
COMMENT ON COLUMN disc_tests.psychological_profile IS 'Perfil psicológico completo com código tipo MBTI-like';
COMMENT ON COLUMN disc_tests.integrated_analysis IS 'Análise integrada da Marina incluindo DISC + Valores + Tipos Psicológicos';
```

6. Clique em: **Run** (ou pressione Ctrl+Enter)
7. Verifique que apareceu: **Success. No rows returned**

### Validar:
```sql
-- Verificar que colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'disc_tests' 
AND column_name IN ('value_scores', 'dominant_values', 'value_percentages', 'psychological_scores', 'psychological_profile', 'integrated_analysis');
```

Deve retornar 6 linhas.

---

## PASSO 2: ATUALIZAR `/api/ai/calculate-result` 

### Prioridade: ALTA
### Tempo estimado: 15 minutos

### Arquivo: `app/api/ai/calculate-result/route.ts`

### O que fazer:

#### 1. Adicionar imports:
```typescript
import { calculateIntegratedProfile } from '@/utils/calculateIntegratedProfile';
import type { ExtendedAnswer } from '@/types/integrated-profile';
```

#### 2. Converter respostas para formato estendido:
```typescript
// Após receber answers do request
const extendedAnswers: ExtendedAnswer[] = answers.map((answer: any) => ({
  questionId: answer.questionId,
  selectedOptions: answer.selectedOptions.map((opt: any) => ({
    type: opt.type,
    valueType: opt.valueType,
    psychTraits: opt.psychTraits,
  })),
}));
```

#### 3. Calcular perfil integrado:
```typescript
// Calcular perfil integrado
const integratedProfile = calculateIntegratedProfile(extendedAnswers);
```

#### 4. Passar para Marina:
```typescript
const marinaInput = {
  scores: integratedProfile.disc.scores,
  percentages: integratedProfile.disc.percentages,
  dominantProfile: integratedProfile.disc.dominant,
  questionCount: answers.length,
  valueProfile: integratedProfile.values,
  psychologicalProfile: integratedProfile.psychological,
};
```

#### 5. Salvar no banco:
```typescript
const { data: savedTest, error: saveError } = await supabase
  .from('disc_tests')
  .insert({
    user_id: userId,
    scores: integratedProfile.disc.scores,
    percentages: integratedProfile.disc.percentages,
    dominant_profile: integratedProfile.disc.dominant,
    question_count: answers.length,
    question_source: 'static',
    generated_questions: null,
    // Novos campos
    value_scores: integratedProfile.values?.scores || null,
    dominant_values: integratedProfile.values ? [integratedProfile.values.dominant, ...integratedProfile.values.secondary] : null,
    value_percentages: integratedProfile.values?.percentages || null,
    psychological_scores: integratedProfile.psychological?.scores || null,
    psychological_profile: integratedProfile.psychological || null,
    integrated_analysis: marinaResult.data.analysis,
  })
  .select()
  .single();
```

---

## PASSO 3: ATUALIZAR `/api/ai/chat`

### Prioridade: ALTA
### Tempo estimado: 10 minutos

### Arquivo: `app/api/ai/chat/route.ts`

### O que fazer:

#### 1. Carregar perfil integrado do banco:
```typescript
// Após carregar latestTest
const context: VXAgentContext = {
  userId: user.id,
  userName: profile.full_name,
  userEmail: profile.email,
  jobTitle: profile.job_title || undefined,
  company: profile.company || undefined,
  testObjective: profile.test_objective || undefined,
  scores: latestTest.scores,
  percentages: latestTest.percentages,
  dominantProfile: latestTest.dominant_profile,
  // Novos campos
  valueProfile: latestTest.value_scores ? {
    dominant: latestTest.dominant_values?.[0] as any,
    secondary: latestTest.dominant_values?.slice(1) as any[] || [],
    scores: latestTest.value_scores as any,
    percentages: latestTest.value_percentages as any,
  } : undefined,
  psychologicalProfile: latestTest.psychological_profile || undefined,
  marinaAnalysis: latestTest.integrated_analysis || latestTest.ai_analysis || undefined,
};
```

---

## PASSO 4: ATUALIZAR UI DO RESULTADO

### Prioridade: MÉDIA
### Tempo estimado: 30 minutos

### Arquivo: `app/result/page.tsx`

### O que fazer:

#### 1. Adicionar imports:
```typescript
import type { ValueProfile, PsychologicalProfile } from '@/types/integrated-profile';
import { VALUE_NAMES, VALUE_DESCRIPTIONS, PSYCHOLOGICAL_NAMES, PSYCHOLOGICAL_DESCRIPTIONS } from '@/types/integrated-profile';
```

#### 2. Adicionar estados:
```typescript
const [valueProfile, setValueProfile] = useState<ValueProfile | null>(null);
const [psychologicalProfile, setPsychologicalProfile] = useState<PsychologicalProfile | null>(null);
```

#### 3. Carregar do banco:
```typescript
// No loadResult(), após carregar latestTest
if (latestTest.value_scores) {
  setValueProfile({
    dominant: latestTest.dominant_values?.[0] as any,
    secondary: latestTest.dominant_values?.slice(1) as any[] || [],
    scores: latestTest.value_scores as any,
    percentages: latestTest.value_percentages as any,
  });
}

if (latestTest.psychological_profile) {
  setPsychologicalProfile(latestTest.psychological_profile as any);
}
```

#### 4. Adicionar seção de Valores (após seção DISC):
```tsx
{/* Seus Motivadores */}
{valueProfile && (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
    <h3 className="text-2xl font-bold text-white mb-6">
      Seus Motivadores Internos
    </h3>
    
    <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-xl p-6 mb-6">
      <p className="text-orange-300 text-sm mb-2">Valor Dominante</p>
      <h4 className="text-2xl font-bold text-white mb-2">
        {VALUE_NAMES[valueProfile.dominant]}
      </h4>
      <p className="text-gray-300">
        {VALUE_DESCRIPTIONS[valueProfile.dominant]}
      </p>
    </div>

    <div className="space-y-4">
      {Object.entries(valueProfile.scores).map(([key, score]) => {
        const percentage = valueProfile.percentages[key as keyof typeof valueProfile.percentages];
        const isDominant = key === valueProfile.dominant;
        
        return (
          <div key={key}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">
                  {VALUE_NAMES[key as keyof typeof VALUE_NAMES]}
                </span>
                {isDominant && (
                  <span className="text-orange-500 text-sm">★ Dominante</span>
                )}
              </div>
              <span className="text-orange-500 font-bold">
                {score} pts ({percentage}%)
              </span>
            </div>
            <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
```

#### 5. Adicionar seção de Tipos Psicológicos:
```tsx
{/* Seu Estilo Psicológico */}
{psychologicalProfile && (
  <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
    <h3 className="text-2xl font-bold text-white mb-6">
      Seu Estilo de Pensamento e Decisão
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div className="bg-gray-900/50 rounded-xl p-6">
        <p className="text-gray-400 text-sm mb-2">Energia</p>
        <p className="text-xl font-bold text-white mb-2">
          {PSYCHOLOGICAL_NAMES.energy[psychologicalProfile.energy]}
        </p>
        <p className="text-gray-400 text-sm">
          {PSYCHOLOGICAL_DESCRIPTIONS.energy[psychologicalProfile.energy]}
        </p>
      </div>
      
      <div className="bg-gray-900/50 rounded-xl p-6">
        <p className="text-gray-400 text-sm mb-2">Percepção</p>
        <p className="text-xl font-bold text-white mb-2">
          {PSYCHOLOGICAL_NAMES.perception[psychologicalProfile.perception]}
        </p>
        <p className="text-gray-400 text-sm">
          {PSYCHOLOGICAL_DESCRIPTIONS.perception[psychologicalProfile.perception]}
        </p>
      </div>
      
      <div className="bg-gray-900/50 rounded-xl p-6">
        <p className="text-gray-400 text-sm mb-2">Decisão</p>
        <p className="text-xl font-bold text-white mb-2">
          {PSYCHOLOGICAL_NAMES.decision[psychologicalProfile.decision]}
        </p>
        <p className="text-gray-400 text-sm">
          {PSYCHOLOGICAL_DESCRIPTIONS.decision[psychologicalProfile.decision]}
        </p>
      </div>
      
      <div className="bg-gray-900/50 rounded-xl p-6">
        <p className="text-gray-400 text-sm mb-2">Organização</p>
        <p className="text-xl font-bold text-white mb-2">
          {PSYCHOLOGICAL_NAMES.organization[psychologicalProfile.organization]}
        </p>
        <p className="text-gray-400 text-sm">
          {PSYCHOLOGICAL_DESCRIPTIONS.organization[psychologicalProfile.organization]}
        </p>
      </div>
    </div>
    
    <div className="text-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
      <p className="text-gray-400 text-sm mb-2">Código Psicológico</p>
      <p className="text-3xl font-bold text-purple-400">
        {psychologicalProfile.code}
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Baseado em {Object.values(result.scores).reduce((a, b) => a + b, 0)} respostas
      </p>
    </div>
  </div>
)}
```

#### 6. Atualizar análise da Marina para usar `integrated_analysis`:
```typescript
// No loadResult()
setResult({
  scores: latestTest.scores as DISCScores,
  completedAt: latestTest.created_at,
  aiAnalysis: latestTest.integrated_analysis || latestTest.ai_analysis || null,
});
```

---

## PASSO 5: TESTAR FLUXO COMPLETO

### Prioridade: ALTA
### Tempo estimado: 20 minutos

### Teste 1: Compatibilidade (Perguntas Antigas)
1. Iniciar servidor: `npm run dev`
2. Fazer login
3. Fazer teste DISC normal (20 perguntas estáticas)
4. Verificar resultado:
   - ✅ DISC exibido corretamente
   - ✅ Análise da Marina gerada
   - ✅ Chat do Lucas funciona
   - ✅ Sem erros no console
   - ✅ Seções de Valores e Psicológico NÃO aparecem (correto)

### Teste 2: Perfil Integrado (Quando implementar geração dinâmica)
1. Gerar perguntas com QuestionGeneratorAgent (10-100)
2. Fazer teste completo
3. Verificar resultado:
   - ✅ DISC exibido
   - ✅ Valores exibidos
   - ✅ Tipos Psicológicos exibidos
   - ✅ Análise integrada da Marina
   - ✅ Chat do Lucas usa perfil completo

---

## PASSO 6: CRIAR TESTES AUTOMATIZADOS

### Prioridade: BAIXA
### Tempo estimado: 30 minutos

### Arquivo: `utils/__tests__/calculateIntegratedProfile.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import {
  calculateDISCScores,
  calculateValueScores,
  calculatePsychologicalProfile,
  calculateIntegratedProfile,
  convertLegacyAnswers,
} from '../calculateIntegratedProfile';

describe('calculateIntegratedProfile', () => {
  it('should calculate DISC only for legacy answers', () => {
    const answers = [
      {
        questionId: 1,
        selectedOptions: [{ type: 'D' as const }],
      },
      {
        questionId: 2,
        selectedOptions: [{ type: 'I' as const }],
      },
    ];

    const result = calculateIntegratedProfile(answers);
    
    expect(result.disc.scores.D).toBe(1);
    expect(result.disc.scores.I).toBe(1);
    expect(result.values).toBeUndefined();
    expect(result.psychological).toBeUndefined();
  });

  it('should calculate full profile with values and psychological', () => {
    const answers = [
      {
        questionId: 1,
        selectedOptions: [{
          type: 'D' as const,
          valueType: 'political' as const,
          psychTraits: {
            energy: 'extrovert' as const,
            perception: 'intuitive' as const,
            decision: 'rational' as const,
            organization: 'structured' as const,
          },
        }],
      },
    ];

    const result = calculateIntegratedProfile(answers);
    
    expect(result.disc.scores.D).toBe(1);
    expect(result.values?.dominant).toBe('political');
    expect(result.psychological?.energy).toBe('extrovert');
  });
});
```

---

## 📋 CHECKLIST FINAL

- [ ] **PASSO 1**: Aplicar migration no Supabase
- [ ] **PASSO 2**: Atualizar `/api/ai/calculate-result`
- [ ] **PASSO 3**: Atualizar `/api/ai/chat`
- [ ] **PASSO 4**: Atualizar UI do resultado
- [ ] **PASSO 5**: Testar fluxo completo
- [ ] **PASSO 6**: Criar testes automatizados

---

## 🚀 ORDEM RECOMENDADA

1. **PASSO 1** (2 min) - Aplicar migration
2. **PASSO 2** (15 min) - Atualizar API de cálculo
3. **PASSO 5.1** (10 min) - Testar compatibilidade
4. **PASSO 3** (10 min) - Atualizar API de chat
5. **PASSO 4** (30 min) - Atualizar UI
6. **PASSO 5.2** (10 min) - Testar perfil integrado
7. **PASSO 6** (30 min) - Criar testes

**Tempo total estimado**: ~2 horas

---

**Criado por**: Kiro AI  
**Data**: 05/05/2026  
**Versão**: 1.0
