# Development Environment Setup Script for gRPC Bridge (Windows PowerShell)
# Run this script in PowerShell as Administrator for best results

Write-Host "🚀 Setting up gRPC Bridge development environment for Windows..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

# Function to check if command exists
function Test-Command($command) {
    try {
        if (Get-Command $command -ErrorAction SilentlyContinue) {
            return $true
        }
    }
    catch {
        return $false
    }
    return $false
}

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator. Some installations might fail." -ForegroundColor Yellow
}

# Check Node.js
Write-Host "🔍 Checking Node.js..." -ForegroundColor Green
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js found: $nodeVersion" -ForegroundColor Green
    
    # Check version
    $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
    if ($majorVersion -lt 18) {
        Write-Host "   ⚠️  Warning: Node.js version should be 18 or higher" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Node.js not found" -ForegroundColor Red
    Write-Host "   📥 Installing Node.js..." -ForegroundColor Blue
    
    if (Test-Command "winget") {
        winget install OpenJS.NodeJS
    } else {
        Write-Host "   Please install Node.js manually from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
}

# Check pnpm
Write-Host "🔍 Checking pnpm..." -ForegroundColor Green
if (Test-Command "pnpm") {
    $pnpmVersion = pnpm --version
    Write-Host "   ✅ pnpm found: v$pnpmVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  pnpm not found, installing..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "   ✅ pnpm installed" -ForegroundColor Green
}

# Check Rust
Write-Host "🔍 Checking Rust..." -ForegroundColor Green
if (Test-Command "rustc") {
    $rustVersion = rustc --version
    Write-Host "   ✅ Rust found: $rustVersion" -ForegroundColor Green
} else {
    Write-Host "   ❌ Rust not found" -ForegroundColor Red
    Write-Host "   📥 Installing Rust..." -ForegroundColor Blue
    
    if (Test-Command "winget") {
        winget install Rustlang.Rustup
    } else {
        Write-Host "   Please install Rust manually from https://rustup.rs/" -ForegroundColor Red
        exit 1
    }
}

# Check Visual Studio Build Tools
Write-Host "🔍 Checking Visual Studio Build Tools..." -ForegroundColor Green
$vsBuildTools = Get-ChildItem -Path "C:\Program Files*" -Name "*Visual Studio*" -Directory 2>$null
if ($vsBuildTools) {
    Write-Host "   ✅ Visual Studio Build Tools found" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Visual Studio Build Tools not found" -ForegroundColor Yellow
    Write-Host "   📥 Installing Visual Studio Build Tools..." -ForegroundColor Blue
    
    if (Test-Command "winget") {
        winget install Microsoft.VisualStudio.2022.BuildTools
    } else {
        Write-Host "   Please install Visual Studio Build Tools manually" -ForegroundColor Red
    }
}

# Install Node.js dependencies
Write-Host "📦 Installing Node.js dependencies..." -ForegroundColor Green
pnpm install
Write-Host "   ✅ Dependencies installed" -ForegroundColor Green

# Test build
Write-Host "🧪 Testing build..." -ForegroundColor Green
try {
    pnpm build
    Write-Host "   ✅ Frontend build successful" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend build failed" -ForegroundColor Red
    exit 1
}

# Final message
Write-Host ""
Write-Host "🎉 Development environment setup complete!" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "   1. Run 'pnpm tauri dev' to start development" -ForegroundColor Yellow
Write-Host "   2. Run 'pnpm tauri build' to create production build" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Available commands:" -ForegroundColor White
Write-Host "   pnpm tauri dev      - Start development server" -ForegroundColor Gray
Write-Host "   pnpm tauri build    - Build production app" -ForegroundColor Gray
Write-Host "   pnpm lint           - Run linting" -ForegroundColor Gray
Write-Host "   pnpm format         - Format code" -ForegroundColor Gray
Write-Host "   pnpm type-check     - Type check TypeScript" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Happy coding!" -ForegroundColor Magenta
