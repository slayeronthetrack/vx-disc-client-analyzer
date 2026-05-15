# Script para organizar documentacao do projeto VX DISC

Write-Host "Iniciando organizacao da documentacao..." -ForegroundColor Cyan

# Guias e Setup
Get-ChildItem -Filter "GUIA_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "INSTALAR_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "INSTALL_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "CONFIGURAR_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "DEPLOY_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "MIGRATION_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "MIGRACAO_*.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "QUICK_START.md" | Move-Item -Destination "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue

# Fases Completadas
Get-ChildItem -Filter "FASE_*.md" | Move-Item -Destination "_docs_archive\02_fases_completadas\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "IMPLEMENTACAO_*.md" | Move-Item -Destination "_docs_archive\02_fases_completadas\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "RESUMO_*.md" | Move-Item -Destination "_docs_archive\02_fases_completadas\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "RESULTADO_*.md" | Move-Item -Destination "_docs_archive\02_fases_completadas\" -Force -ErrorAction SilentlyContinue

# Debug e Correcoes
Get-ChildItem -Filter "CORRECAO_*.md" | Move-Item -Destination "_docs_archive\03_debug_correcoes\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "CORRIGIR_*.md" | Move-Item -Destination "_docs_archive\03_debug_correcoes\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "DEBUG_*.md" | Move-Item -Destination "_docs_archive\03_debug_correcoes\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "DIAGNOSTICO_*.md" | Move-Item -Destination "_docs_archive\03_debug_correcoes\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "ERRO_*.md" | Move-Item -Destination "_docs_archive\03_debug_correcoes\" -Force -ErrorAction SilentlyContinue

# Scripts SQL
Get-ChildItem -Filter "*.sql" | Move-Item -Destination "_docs_archive\04_scripts_sql\" -Force -ErrorAction SilentlyContinue

# Scripts de Teste
Get-ChildItem -Filter "*.js" | Move-Item -Destination "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "TESTE_*.md" | Move-Item -Destination "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "COMO_TESTAR_*.md" | Move-Item -Destination "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "TESTAR_*.md" | Move-Item -Destination "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "VALIDACAO_*.md" | Move-Item -Destination "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "PLANO_TESTES_*.md" | Move-Item -Destination "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue

# Status e Resumos
Get-ChildItem -Filter "STATUS_*.md" | Move-Item -Destination "_docs_archive\06_resumos_status\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "INVENTARIO_*.md" | Move-Item -Destination "_docs_archive\06_resumos_status\" -Force -ErrorAction SilentlyContinue

# Checklists
Get-ChildItem -Filter "CHECKLIST_*.md" | Move-Item -Destination "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "ROADMAP_*.md" | Move-Item -Destination "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "BACKLOG_*.md" | Move-Item -Destination "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "PASSO_A_PASSO_*.md" | Move-Item -Destination "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "PROXIMOS_PASSOS*.md" | Move-Item -Destination "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue
Get-ChildItem -Filter "EXECUTAR_*.md" | Move-Item -Destination "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Conclusao:" -ForegroundColor Green

Get-ChildItem "_docs_archive" -Directory | ForEach-Object {
    $count = @(Get-ChildItem $_.FullName -File -Recurse).Count
    Write-Host "  $($_.Name): $count arquivos"
}
