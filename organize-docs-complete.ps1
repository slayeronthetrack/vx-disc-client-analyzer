# Script para mover TODA documentacao para arquivo
# Exclui apenas arquivos essenciais do projeto

$essentialFiles = @(
    "README.md",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.tsbuildinfo",
    ".env.local",
    ".env.example",
    "jest.config.js",
    "jest.setup.js",
    "next.config.js",
    "tailwind.config.ts",
    "postcss.config.js",
    "vercel.json"
)

Write-Host "Organizando TODA documentacao..." -ForegroundColor Cyan
Write-Host ""

$totalMoved = 0

# Processar arquivo por arquivo
Get-ChildItem -File | ForEach-Object {
    $fileName = $_.Name
    
    # Pular arquivos essenciais
    if ($fileName -in $essentialFiles) {
        return
    }
    
    # Mover .md files
    if ($fileName -like "*.md") {
        # Categorizar por tipo
        if ($fileName -like "*GUIA*" -or $fileName -like "*INSTALL*" -or $fileName -like "*DEPLOY*" -or $fileName -like "*CONFIGURAR*" -or $fileName -like "*MIGRATION*") {
            Move-Item $_.FullName "_docs_archive\01_guias_setup\" -Force -ErrorAction SilentlyContinue
        }
        elseif ($fileName -like "*FASE*" -or $fileName -like "*IMPLEMENTACAO*" -or $fileName -like "*COMPLETO*" -or $fileName -like "*RESUMO*" -or $fileName -like "*RESULTADO*" -or $fileName -like "*EXECUTIVO*") {
            Move-Item $_.FullName "_docs_archive\02_fases_completadas\" -Force -ErrorAction SilentlyContinue
        }
        elseif ($fileName -like "*CORRECAO*" -or $fileName -like "*CORRIGIR*" -or $fileName -like "*DEBUG*" -or $fileName -like "*DIAGNOSTICO*" -or $fileName -like "*ERRO*" -or $fileName -like "*RLS*") {
            Move-Item $_.FullName "_docs_archive\03_debug_correcoes\" -Force -ErrorAction SilentlyContinue
        }
        elseif ($fileName -like "*TESTE*" -or $fileName -like "*TESTAR*" -or $fileName -like "*VALIDACAO*" -or $fileName -like "*PLANO*TESTE*" -or $fileName -like "*RELATORIO*TEST*") {
            Move-Item $_.FullName "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
        }
        elseif ($fileName -like "*STATUS*" -or $fileName -like "*INVENTARIO*" -or $fileName -like "*CONSOLIDADO*") {
            Move-Item $_.FullName "_docs_archive\06_resumos_status\" -Force -ErrorAction SilentlyContinue
        }
        elseif ($fileName -like "*CHECKLIST*" -or $fileName -like "*ROADMAP*" -or $fileName -like "*BACKLOG*" -or $fileName -like "*PASSO*" -or $fileName -like "*PROXIMOS*" -or $fileName -like "*EXECUTAR*" -or $fileName -like "*EXECUTE*") {
            Move-Item $_.FullName "_docs_archive\07_checklists\" -Force -ErrorAction SilentlyContinue
        }
        else {
            # Resto para fases completadas
            Move-Item $_.FullName "_docs_archive\02_fases_completadas\" -Force -ErrorAction SilentlyContinue
        }
        $totalMoved++
    }
    
    # Mover .sql files
    elseif ($fileName -like "*.sql") {
        Move-Item $_.FullName "_docs_archive\04_scripts_sql\" -Force -ErrorAction SilentlyContinue
        $totalMoved++
    }
    
    # Mover .js files (exceto package essenciais)
    elseif ($fileName -like "*.js" -and $fileName -notlike "package*") {
        Move-Item $_.FullName "_docs_archive\05_scripts_teste\" -Force -ErrorAction SilentlyContinue
        $totalMoved++
    }
}

Write-Host "Total de arquivos movidos: $totalMoved" -ForegroundColor Green
Write-Host ""
Write-Host "Distribuicao final:" -ForegroundColor Cyan
Write-Host ""

Get-ChildItem "_docs_archive" -Directory | ForEach-Object {
    $count = @(Get-ChildItem $_.FullName -File -Recurse).Count
    Write-Host "  $($_.Name): $count arquivos"
}

Write-Host ""
Write-Host "Raiz do projeto limpa com sucesso!" -ForegroundColor Green
