# Vercel Environment Variables Setup Script
# Run this script after getting your Vercel token

Write-Output "🚀 Vercel Environment Variables Setup"
Write-Output "======================================"
Write-Output ""

# Check if Vercel token is provided
if (-not $env:VERCEL_TOKEN) {
    Write-Output "❌ VERCEL_TOKEN not found in environment"
    Write-Output ""
    Write-Output "Please set your Vercel token:"
    Write-Output "  `$env:VERCEL_TOKEN = 'your-token-here'"
    Write-Output ""
    Write-Output "Get your token from: https://vercel.com/account/tokens"
    exit 1
}

Write-Output "✅ Found VERCEL_TOKEN"
Write-Output ""

# Set environment variables
$variables = @(
    @{Name="NEXT_PUBLIC_SUPABASE_URL"; Value="https://bpyqxdgpmrybrqjerkfw.supabase.co"},
    @{Name="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Value="sb_publishable_rEmONiAglWMEPfoPPYFn0w_-UhAUceZ"},
    @{Name="AGENT_SECRET_KEY"; Value=$env:AGENT_SECRET_KEY},
    @{Name="CRON_SECRET"; Value=$env:CRON_SECRET},
    @{Name="NEXT_PUBLIC_APP_URL"; Value="https://worldcup-predictor-7aewq7ppx-chundongtous-projects.vercel.app"},
    @{Name="LIVE_SYNC_ENABLED"; Value="true"}
)

foreach ($var in $variables) {
    if ($var.Value) {
        Write-Output "Setting $($var.Name)..."
        $var.Value | vercel env add $var.Name production --token=$env:VERCEL_TOKEN
        if ($LASTEXITCODE -eq 0) {
            Write-Output "  ✅ $($var.Name) set"
        } else {
            Write-Output "  ⚠️  $($var.Name) may already exist or failed"
        }
    } else {
        Write-Output "⚠️  Skipping $($var.Name) (no value provided)"
    }
}

Write-Output ""
Write-Output "✅ Setup complete!"
Write-Output ""
Write-Output "Next steps:"
Write-Output "1. Go to https://vercel.com/dashboard"
Write-Output "2. Find your 'worldcup-predictor' project"
Write-Output "3. Verify environment variables are set"
Write-Output "4. Redeploy the project to apply changes"
