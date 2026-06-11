# World Cup Predictor - Full Setup Script
# This script configures all environment variables and services

Write-Output "🚀 World Cup Predictor - Full Setup"
Write-Output "===================================="
Write-Output ""

# Check prerequisites
$missing = @()

if (-not $env:VERCEL_TOKEN) {
    $missing += "VERCEL_TOKEN"
}

if (-not $env:FOOTBALL_DATA_KEY -and -not $env:API_FOOTBALL_KEY) {
    $missing += "FOOTBALL_DATA_KEY or API_FOOTBALL_KEY"
}

if (-not $env:SUPABASE_SERVICE_ROLE_KEY) {
    $missing += "SUPABASE_SERVICE_ROLE_KEY"
}

if ($missing.Count -gt 0) {
    Write-Output "❌ Missing required environment variables:"
    foreach ($var in $missing) {
        Write-Output "   - $var"
    }
    Write-Output ""
    Write-Output "Please set these variables and run the script again."
    Write-Output ""
    Write-Output "Example:"
    Write-Output '  $env:VERCEL_TOKEN = "your-vercel-token"'
    Write-Output '  $env:FOOTBALL_DATA_KEY = "your-football-data-key"'
    Write-Output '  $env:SUPABASE_SERVICE_ROLE_KEY = "your-supabase-service-role-key"'
    exit 1
}

Write-Output "✅ All required variables found"
Write-Output ""

# Step 1: Configure Vercel environment variables
Write-Output "1️⃣ Configuring Vercel environment variables..."
$vercelVars = @(
    @{Name="NEXT_PUBLIC_SUPABASE_URL"; Value="https://bpyqxdgpmrybrqjerkfw.supabase.co"},
    @{Name="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Value="sb_publishable_rEmONiAglWMEPfoPPYFn0w_-UhAUceZ"},
    @{Name="AGENT_SECRET_KEY"; Value=$env:AGENT_SECRET_KEY},
    @{Name="CRON_SECRET"; Value=$env:CRON_SECRET},
    @{Name="NEXT_PUBLIC_APP_URL"; Value="https://worldcup-predictor-7aewq7ppx-chundongtous-projects.vercel.app"},
    @{Name="LIVE_SYNC_ENABLED"; Value="true"},
    @{Name="FOOTBALL_DATA_KEY"; Value=$env:FOOTBALL_DATA_KEY},
    @{Name="API_FOOTBALL_KEY"; Value=$env:API_FOOTBALL_KEY}
)

foreach ($var in $vercelVars) {
    if ($var.Value) {
        Write-Output "   Setting $($var.Name)..."
        $var.Value | vercel env add $var.Name production --token=$env:VERCEL_TOKEN 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Output "   ✅ $($var.Name) set"
        } else {
            Write-Output "   ⚠️  $($var.Name) may already exist"
        }
    }
}

Write-Output ""

# Step 2: Set GitHub secrets
Write-Output "2️⃣ Setting GitHub secrets..."
$githubSecrets = @(
    @{Name="FOOTBALL_DATA_KEY"; Value=$env:FOOTBALL_DATA_KEY},
    @{Name="API_FOOTBALL_KEY"; Value=$env:API_FOOTBALL_KEY},
    @{Name="SUPABASE_SERVICE_ROLE_KEY"; Value=$env:SUPABASE_SERVICE_ROLE_KEY}
)

foreach ($secret in $githubSecrets) {
    if ($secret.Value) {
        Write-Output "   Setting $($secret.Name)..."
        gh secret set $secret.Name --repo chundongtou/worldcup-predictor --body $secret.Value 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Output "   ✅ $($secret.Name) set"
        } else {
            Write-Output "   ❌ Failed to set $($secret.Name)"
        }
    }
}

Write-Output ""

# Step 3: Enable Supabase Realtime
Write-Output "3️⃣ Enabling Supabase Realtime..."
Write-Output "   ⚠️  This requires manual action:"
Write-Output "   1. Go to https://supabase.com/dashboard"
Write-Output "   2. Select your project (bpyqxdgpmrybrqjerkfw)"
Write-Output "   3. Go to Database → Replication"
Write-Output "   4. Enable Realtime for the 'matches' table"
Write-Output ""

# Step 4: Redeploy Vercel
Write-Output "4️⃣ Redeploying Vercel project..."
Write-Output "   Triggering redeploy..."
gh api repos/chundongtou/worldcup-predictor/deployments -X POST -f ref=master -f environment=production 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Output "   ✅ Redeploy triggered"
} else {
    Write-Output "   ⚠️  Redeploy may need to be triggered manually"
}

Write-Output ""

# Step 5: Test the pipeline
Write-Output "5️⃣ Testing sync pipeline..."
Write-Output "   Waiting 30 seconds for redeploy to complete..."
Start-Sleep -Seconds 30

Write-Output "   Testing full pipeline..."
$testUrl = "https://worldcup-predictor-7aewq7ppx-chundongtous-projects.vercel.app/api/sync/full-pipeline"
try {
    $response = Invoke-RestMethod -Uri $testUrl -Method GET -Headers @{
        "x-cron-secret" = $env:CRON_SECRET
    } -TimeoutSec 60
    Write-Output "   ✅ Pipeline test successful"
    Write-Output "   Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Output "   ⚠️  Pipeline test failed (may need more time): $($_.Exception.Message)"
}

Write-Output ""
Write-Output "✅ Setup complete!"
Write-Output ""
Write-Output "Next steps:"
Write-Output "1. Verify Vercel deployment at https://vercel.com/dashboard"
Write-Output "2. Check GitHub Actions at https://github.com/chundongtou/worldcup-predictor/actions"
Write-Output "3. Monitor sync pipeline at https://worldcup-predictor-7aewq7ppx-chundongtous-projects.vercel.app/api/sync"
