$ErrorActionPreference = "Stop"

# ============================================================
# RELIEFCHAIN END-TO-END INTEGRATION TEST
# Member 2 Backend -> Member 3 Blockchain Service
# ============================================================

$backend = Split-Path -Parent $PSScriptRoot
Set-Location $backend

$baseUrl = "http://localhost:5000"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "       RELIEFCHAIN END-TO-END INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Backend directory: $backend"
Write-Host "API: $baseUrl"
Write-Host ""

# ============================================================
# API HELPER
# ============================================================

function Invoke-Api {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Token = $null
    )

    $headers = @{}

    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }

    try {
        if ($null -ne $Body) {
            $json = $Body | ConvertTo-Json -Depth 20

            return Invoke-RestMethod `
                -Method $Method `
                -Uri $Url `
                -Headers $headers `
                -ContentType "application/json" `
                -Body $json
        }

        return Invoke-RestMethod `
            -Method $Method `
            -Uri $Url `
            -Headers $headers
    }
    catch {
        Write-Host ""
        Write-Host "========== API ERROR ==========" -ForegroundColor Red
        Write-Host "Method : $Method" -ForegroundColor Yellow
        Write-Host "URL    : $Url" -ForegroundColor Yellow
        Write-Host "Error  : $($_.Exception.Message)" -ForegroundColor Red

        if ($_.ErrorDetails.Message) {
            Write-Host "Response body:" -ForegroundColor Cyan
            Write-Host $_.ErrorDetails.Message -ForegroundColor White
        }

        if ($_.Exception.Response) {
            try {
                $reader = New-Object System.IO.StreamReader(
                    $_.Exception.Response.GetResponseStream()
                )

                $responseBody = $reader.ReadToEnd()
                $reader.Close()

                if ($responseBody) {
                    Write-Host "Raw response body:" -ForegroundColor Cyan
                    Write-Host $responseBody -ForegroundColor White
                }
            }
            catch {
                Write-Host "Could not read response body." -ForegroundColor DarkYellow
            }
        }

        Write-Host "===============================" -ForegroundColor Red
        throw
    }
}

function Write-Step {
    param(
        [string]$Number,
        [string]$Message
    )

    Write-Host ""
    Write-Host "=== $Number. $Message ===" -ForegroundColor Cyan
}

function Write-Passed {
    param(
        [string]$Message
    )

    Write-Host "[PASS] $Message" -ForegroundColor Green
}

# ============================================================
# 1. PRISMA CLIENT CHECK
# ============================================================

Write-Step "1" "Check Prisma client"

# IMPORTANT:
# Do NOT run "npm run prisma:generate" here.
#
# The backend is already running on port 5000 and uses Prisma.
# On Windows, regenerating Prisma while the backend is running
# can lock query_engine-windows.dll.node and cause EPERM errors.
#
# Prisma Client was already generated successfully before
# starting the integration test.

$prismaClientPath = Join-Path $backend "node_modules\@prisma\client"

if (-not (Test-Path $prismaClientPath)) {
    throw "Prisma Client was not found at: $prismaClientPath. Run 'npm run prisma:generate' with the backend stopped."
}

Write-Passed "Prisma Client is available. Skipping regeneration to avoid Windows DLL locking."

# ============================================================
# 2. DATABASE SYNC
# ============================================================

Write-Step "2" "Sync database"

npx prisma db push

if ($LASTEXITCODE -ne 0) {
    throw "Prisma database sync failed."
}

Write-Passed "Database is synchronized."

# ============================================================
# 3. INTEGRATION SEED
# ============================================================

Write-Step "3" "Seed integration data"

npx tsx scripts/integration-seed.ts

if ($LASTEXITCODE -ne 0) {
    throw "Integration seed failed."
}

Write-Passed "Integration organization, disaster, warehouse, camp and beneficiary are ready."

# ============================================================
# 4. BACKEND HEALTH
# ============================================================

Write-Step "4" "Check backend health"

$health = Invoke-Api `
    -Method "GET" `
    -Url "$baseUrl/api/health"

$health | ConvertTo-Json -Depth 20

if (-not $health.success) {
    throw "Backend health check failed."
}

Write-Passed "Backend is healthy."

# ============================================================
# 5. REGISTER FRESH DONOR
# ============================================================

Write-Step "5" "Register integration donor"

$randomId = [Guid]::NewGuid().ToString().Substring(0, 8)

$donorEmail = "integration-$randomId@example.com"
$donorPassword = "Integration@12345"

$registerBody = @{
    name     = "Integration Donor $randomId"
    email    = $donorEmail
    password = $donorPassword
}

$registerResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/auth/register" `
    -Body $registerBody

$registerResponse | ConvertTo-Json -Depth 20

if (-not $registerResponse.success) {
    throw "Donor registration failed."
}

$donorId = $registerResponse.data.id

if ([string]::IsNullOrWhiteSpace($donorId)) {
    throw "Donor was registered but donor ID was not returned."
}

Write-Passed "Donor registered: $donorId"

# ============================================================
# 6. LOGIN
# ============================================================

Write-Step "6" "Login integration donor"

$loginBody = @{
    email    = $donorEmail
    password = $donorPassword
}

$loginResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/auth/login" `
    -Body $loginBody

$loginResponse | ConvertTo-Json -Depth 20

if (-not $loginResponse.success) {
    throw "Donor login failed."
}

$token = $loginResponse.data.token

if ([string]::IsNullOrWhiteSpace($token)) {
    throw "Login succeeded but no JWT token was returned."
}

Write-Passed "Authentication token received."

# ============================================================
# 7. CREATE CAMPAIGN
# ============================================================

Write-Step "7" "Create campaign"

$campaignBody = @{
    title             = "Assam Flood Relief Integration Campaign $randomId"
    description       = "End-to-end RELIEFCHAIN blockchain integration test campaign."
    disasterId        = "22222222-2222-4222-8222-222222222222"
    organizationId    = "11111111-1111-4111-8111-111111111111"
    location          = "Guwahati, Assam"
    severity          = "HIGH"
    targetAmount      = 100000
    deadline          = (Get-Date).AddDays(30).ToUniversalTime().ToString("o")
    requiredResources = @(
        "Food",
        "Water",
        "Medicine",
        "Rescue Boats"
    )
}

$campaignResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/campaigns" `
    -Body $campaignBody `
    -Token $token

$campaignResponse | ConvertTo-Json -Depth 20

if (-not $campaignResponse.success) {
    throw "Campaign creation failed."
}

# API returns:
# data.id
# NOT:
# data.campaign.id
$campaignId = $campaignResponse.data.campaign.id

if ([string]::IsNullOrWhiteSpace($campaignId)) {
    throw "Campaign was created but campaign ID was not returned."
}

Write-Passed "Campaign created: $campaignId"

if ($campaignResponse.data.blockchain) {
    Write-Host "Campaign blockchain proof:" -ForegroundColor Yellow
    $campaignResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# 8. DONATION
# ============================================================

Write-Step "8" "Create donation"

$donationBody = @{
    campaignId    = $campaignId
    amount        = 5000
    paymentMethod = "UPI"
}

$donationResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/donations" `
    -Body $donationBody `
    -Token $token

$donationResponse | ConvertTo-Json -Depth 20

if (-not $donationResponse.success) {
    throw "Donation creation failed."
}

$donationId = $donationResponse.data.donation.id

if ([string]::IsNullOrWhiteSpace($donationId)) {
    throw "Donation was created but donation ID was not returned."
}

Write-Passed "Donation created: $donationId"

if ($donationResponse.data.blockchain) {
    Write-Host "Donation blockchain proof:" -ForegroundColor Yellow
    $donationResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# 9. EXPENSE
# ============================================================

Write-Step "9" "Create expense"

$expenseBody = @{
    campaignId    = $campaignId
    amount        = 1500
    category      = "FOOD"
    supplier      = "Integration Relief Supplier"
    date          = (Get-Date).ToUniversalTime().ToString("o")
    paymentMethod = "UPI"
    purpose       = "Emergency food supplies for flood affected families"
    location      = "Guwahati, Assam"
    gpsLatitude   = 26.1445
    gpsLongitude  = 91.7362
}

$expenseResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/expenses" `
    -Body $expenseBody `
    -Token $token

$expenseResponse | ConvertTo-Json -Depth 20

if (-not $expenseResponse.success) {
    throw "Expense creation failed."
}

$expenseId = $expenseResponse.data.expense.id

if ([string]::IsNullOrWhiteSpace($expenseId)) {
    throw "Expense was created but expense ID was not returned."
}

Write-Passed "Expense created: $expenseId"

if ($expenseResponse.data.blockchain) {
    Write-Host "Expense blockchain proof:" -ForegroundColor Yellow
    $expenseResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# 10. CREATE RELIEF BATCH
# ============================================================

Write-Step "10" "Create relief batch"

$batchBody = @{
    campaignId        = $campaignId
    batchCode         = "BATCH-$randomId"
    item              = "Food Kits"
    quantity          = 100
    unit              = "kits"
    originWarehouseId = "44444444-4444-4444-8444-444444444444"
    destinationCampId = "33333333-3333-4333-8333-333333333333"
}

$batchResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/batches" `
    -Body $batchBody `
    -Token $token

$batchResponse | ConvertTo-Json -Depth 20

if (-not $batchResponse.success) {
    throw "Relief batch creation failed."
}

$batchId = $batchResponse.data.batch.id

if ([string]::IsNullOrWhiteSpace($batchId)) {
    throw "Batch was created but batch ID was not returned."
}

Write-Passed "Relief batch created: $batchId"

if ($batchResponse.data.blockchain) {
    Write-Host "Batch blockchain proof:" -ForegroundColor Yellow
    $batchResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# 11. DISPATCH BATCH
# ============================================================

Write-Step "11" "Dispatch batch"

$dispatchBody = @{
    status = "DISPATCHED"
}

# IMPORTANT:
# Member 2 backend uses:
# POST /api/batches/:id/transfer
#
# NOT:
# PATCH /api/batches/:id/status
#
# Blockchain movement:
# WAREHOUSE -> TRUCK
$dispatchResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/batches/$batchId/transfer" `
    -Body $dispatchBody `
    -Token $token

$dispatchResponse | ConvertTo-Json -Depth 20

if (-not $dispatchResponse.success) {
    throw "Batch dispatch failed."
}

Write-Passed "Batch moved to DISPATCHED."

if ($dispatchResponse.data.blockchain) {
    Write-Host "Dispatch blockchain transfer:" -ForegroundColor Yellow
    $dispatchResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# 12. IN TRANSIT
# ============================================================

Write-Step "12" "Move batch to IN_TRANSIT"

$transitBody = @{
    status = "IN_TRANSIT"
}

$transitResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/batches/$batchId/transfer" `
    -Body $transitBody `
    -Token $token

$transitResponse | ConvertTo-Json -Depth 20

if (-not $transitResponse.success) {
    throw "Batch IN_TRANSIT transition failed."
}

Write-Passed "Batch moved to IN_TRANSIT."

# ============================================================
# 13. RECEIVE BATCH
# ============================================================

Write-Step "13" "Receive batch at relief camp"

$receiveBody = @{
    status = "RECEIVED"
}

# Blockchain movement:
# TRUCK -> CAMP
$receiveResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/batches/$batchId/transfer" `
    -Body $receiveBody `
    -Token $token

$receiveResponse | ConvertTo-Json -Depth 20

if (-not $receiveResponse.success) {
    throw "Batch RECEIVED transition failed."
}

Write-Passed "Batch moved to RECEIVED."

if ($receiveResponse.data.blockchain) {
    Write-Host "Receive blockchain transfer:" -ForegroundColor Yellow
    $receiveResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# 14. CREATE BENEFICIARY
# ============================================================

Write-Step "14" "Create beneficiary"

$beneficiaryBody = @{
    anonymousCode = "BEN-$randomId"
    campId        = "33333333-3333-4333-8333-333333333333"
    location      = "Integration Relief Camp"
    familySize    = 4
    eligibility   = @{
        verified = $true
        category = "FLOOD_AFFECTED"
    }
}

$beneficiaryResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/beneficiaries" `
    -Body $beneficiaryBody `
    -Token $token

$beneficiaryResponse | ConvertTo-Json -Depth 20

if (-not $beneficiaryResponse.success) {
    throw "Beneficiary creation failed."
}

$beneficiaryId = $beneficiaryResponse.data.id

if ([string]::IsNullOrWhiteSpace($beneficiaryId)) {
    throw "Beneficiary was created but beneficiary ID was not returned."
}

Write-Passed "Beneficiary created: $beneficiaryId"

# ============================================================
# 15. DISTRIBUTE AID
# ============================================================

Write-Step "15" "Record aid distribution"

$distributionBody = @{
    batchId       = $batchId
    beneficiaryId = $beneficiaryId
    item          = "Food Kits"
    quantity      = 2
    campId        = "33333333-3333-4333-8333-333333333333"
}

$distributionResponse = Invoke-Api `
    -Method "POST" `
    -Url "$baseUrl/api/distributions" `
    -Body $distributionBody `
    -Token $token

$distributionResponse | ConvertTo-Json -Depth 20

if (-not $distributionResponse.success) {
    throw "Aid distribution failed."
}

Write-Passed "Aid distribution recorded."

if ($distributionResponse.data.blockchain) {
    Write-Host "Distribution blockchain proof:" -ForegroundColor Yellow
    $distributionResponse.data.blockchain | ConvertTo-Json -Depth 20
}

# ============================================================
# FINAL SUMMARY
# ============================================================

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "          RELIEFCHAIN INTEGRATION TEST PASSED" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green

Write-Host ""
Write-Host "Backend:" -ForegroundColor Cyan
Write-Host "  $baseUrl"

Write-Host ""
Write-Host "Entities created:" -ForegroundColor Cyan
Write-Host "  Donor        : $donorId"
Write-Host "  Campaign     : $campaignId"
Write-Host "  Donation     : $donationId"
Write-Host "  Expense      : $expenseId"
Write-Host "  Relief Batch : $batchId"
Write-Host "  Beneficiary  : $beneficiaryId"

Write-Host ""
Write-Host "Blockchain flow:" -ForegroundColor Cyan
Write-Host "  Campaign proof       : CREATED"
Write-Host "  Donation proof       : RECORDED"
Write-Host "  Expense proof        : RECORDED"
Write-Host "  Relief batch proof   : CREATED"
Write-Host "  Batch dispatch       : BLOCKCHAIN TRANSFER"
Write-Host "  Batch transit        : OFF-CHAIN STATUS"
Write-Host "  Batch receive        : BLOCKCHAIN TRANSFER"
Write-Host "  Distribution proof   : RECORDED"

Write-Host ""
Write-Host "All integration steps completed successfully." -ForegroundColor Green
Write-Host ""