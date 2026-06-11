# World Cup Predictor - Interactive Setup Script
# This script prompts for required keys and configures everything

Write-Output "🚀 World Cup Predictor - Interactive Setup"
Write-Output "==========================================="
Write-Output ""

# Prompt for Vercel token
$vercelToken = Read-Host "Enter your Vercel token (from https://vercel.com/account/tokens)"
if (-not $vercelToken) {
    Write-Output "❌ Vercel token is required"
    exit 1
}

# Prompt for Football-Data.org key
$footballDataKey = Read-Host "Enter your Football-Data.org key (from https://www.football-data.org/client/register)"
if (-not $footballDataKey) {
    Write-Output "❌ Football-Data.org key is required"
    exit 1
}

# Prompt for Supabase service role key
$supabaseServiceKey = Read-Host "Enter your Supabase service role key (from https://supabase.com/dashboard → Settings → API)"
if (-not $supabaseServiceKey) {
    Write-Output "❌ Supabase service role key is required"
    exit 1
}

Write-Output ""
Write-Output "✅ All keys provided"
Write-Output ""

# Set environment variables
$env:VERCEL_TOKEN = $vercelToken
$env:FOOTBALL_DATA_KEY = $footballDataKey
$env:SUPABASE_SERVICE_ROLE_KEY = $supabaseServiceKey

# Run the full setup script
Write-Output "Running full setup..."
& "$PSScriptRoot\full-setup.ps1"
