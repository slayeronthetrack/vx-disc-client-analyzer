# Question Bank Scripts

Scripts para manutenção e atualização do banco de perguntas inteligente.

## updateQuestionScores.ts

Atualiza os quality scores das perguntas baseado em métricas de performance.

### Como executar

```bash
# Executar manualmente
npx tsx lib/scripts/updateQuestionScores.ts

# Ou adicionar ao package.json
npm run update-scores
```

### O que faz

1. Busca todas as perguntas ativas
2. Para cada pergunta, obtém métricas de performance
3. Aplica regras de negócio:
   - **Completion rate < 80%**: -10 pontos
   - **Feedback > 4.0**: +5 pontos
   - **Feedback < 2.5**: -5 pontos
   - **Discrimination > 0.7**: +10 pontos
   - **Discrimination < 0.3**: -10 pontos
4. Atualiza status baseado em thresholds:
   - **< 30**: archived
   - **30-60**: flagged
   - **≥ 60**: active

### Agendar execução diária

#### Vercel Cron Jobs

Adicionar em `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-scores",
      "schedule": "0 2 * * *"
    }
  ]
}
```

Criar endpoint `app/api/cron/update-scores/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { updateQuestionScores } from '@/lib/scripts/updateQuestionScores';

export async function GET(request: Request) {
  // Verificar token de autorização
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await updateQuestionScores();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

#### GitHub Actions

Criar `.github/workflows/update-scores.yml`:

```yaml
name: Update Question Scores

on:
  schedule:
    - cron: '0 2 * * *' # Diariamente às 2h UTC
  workflow_dispatch: # Permitir execução manual

jobs:
  update-scores:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx tsx lib/scripts/updateQuestionScores.ts
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## generateEmbeddings.ts

Gera embeddings para perguntas existentes que ainda não têm.

### Como executar

```bash
npx tsx lib/scripts/generateEmbeddings.ts
```

### O que faz

1. Busca perguntas sem embedding
2. Gera embeddings em lote (10 por vez)
3. Salva no campo `embedding_vector`
4. Respeita rate limits da OpenAI

### Quando usar

- Após importar perguntas antigas
- Após criar perguntas manualmente no banco
- Para popular embeddings iniciais

## Monitoramento

Adicionar logs e alertas para:

- Perguntas com score < 40 (bloqueadas)
- Perguntas com score 40-60 (flagged)
- Perguntas com completion rate < 50%
- Perguntas com feedback < 2.0

### Exemplo com Sentry

```typescript
import * as Sentry from '@sentry/nextjs';

if (newScore < 40) {
  Sentry.captureMessage(`Question ${questionId} blocked (score: ${newScore})`, 'warning');
}
```

### Exemplo com Slack

```typescript
if (updates.length > 10) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🔄 Updated ${updates.length} question scores`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: updates.map(u => `• ${u.questionId}: ${u.oldScore} → ${u.newScore}`).join('\n'),
          },
        },
      ],
    }),
  });
}
```
