param([switch]$Broadcast)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$rpc = 'https://rpc-gel.inkonchain.com'
$wallet = '0xA634BcD929951E3f510B96984aeaEDAF06af8e02'
$contract = '0xe92f7634393ef5b6dd9fbc6d81b61e62a39e5164'
$token = '0x2D270e6886d130D724215A266106e6832161EAEd'
$recipient2 = '0x1111111111111111111111111111111111111111'
$amount1 = [System.Numerics.BigInteger]1000000000000
$amount2 = [System.Numerics.BigInteger]2000000000000
$total = $amount1 + $amount2
$cast = "$env:USERPROFILE\.foundry\bin\cast.exe"
if (!(Test-Path $cast)) { throw "Cast not found: $cast" }

function Invoke-Rpc([string]$Method, [object[]]$Params) {
  $body = @{ jsonrpc='2.0'; id=1; method=$Method; params=$Params } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri $rpc -ContentType 'application/json' -Body $body
}

$chainId = [Convert]::ToInt64((Invoke-Rpc 'eth_chainId' @()).result, 16)
if ($chainId -ne 57073) { throw "Wrong chain: $chainId" }
$code = (Invoke-Rpc 'eth_getCode' @($contract, 'latest')).result
if (!$code -or $code -eq '0x') { throw 'Mainnet Tentacle contract has no code.' }

$onchainToken = (& $cast call $contract 'TOKEN()(address)' --rpc-url $rpc).Trim()
if ($onchainToken.ToLower() -ne $token.ToLower()) { throw "TOKEN mismatch: $onchainToken" }

$balanceHex = (Invoke-Rpc 'eth_getBalance' @($wallet, 'latest')).result
$balanceWei = [System.Numerics.BigInteger]::Parse($balanceHex.Substring(2), 'AllowHexSpecifier')
if ($balanceWei -le $total) { throw 'Insufficient Ink ETH for QA value + gas.' }

$recipients = "[$wallet,$recipient2]"
$amounts = "[$amount1,$amount2]"
Write-Host "Ink mainnet contract: $contract"
Write-Host "Sender: $wallet"
Write-Host "Recipients: $wallet, $recipient2"
Write-Host "QA value: $total wei (0.000003 ETH total)"
Write-Host "Mode: $(if($Broadcast){'BROADCAST'}else{'SIMULATION'})"

# eth_call proves the exact calldata succeeds without spending anything.
& $cast call $contract 'batchNative(address[],uint256[])' $recipients $amounts --value $total --from $wallet --rpc-url $rpc | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Mainnet QA simulation failed.' }
Write-Host 'Simulation: PASS'
if (!$Broadcast) { exit 0 }
if ((git status --porcelain)) { throw 'Git working tree must be clean before mainnet QA broadcast.' }
$confirmation = Read-Host 'Type YES_MAINNET_QA to authorize this project-controlled QA transaction'
if ($confirmation -ne 'YES_MAINNET_QA') { throw 'Mainnet QA not authorized.' }

$envFile = Join-Path $root '.env.local'
$keyLine = Get-Content $envFile | Where-Object { $_ -match '^DEPLOYER_PRIVATE_KEY=' } | Select-Object -First 1
if (!$keyLine) { throw 'DEPLOYER_PRIVATE_KEY missing from .env.local' }

try {
  $privateKey = ($keyLine -split '=',2)[1].Trim()
  $tx = (& $cast send $contract 'batchNative(address[],uint256[])' $recipients $amounts `
    --value $total --private-key $privateKey --rpc-url $rpc --async).Trim()
  if ($LASTEXITCODE -ne 0 -or $tx -notmatch '^0x[0-9a-fA-F]{64}$') { throw 'Broadcast did not return a transaction hash.' }
  Write-Host "QA_TX=$tx"
  Write-Host 'Do not retry automatically. Verify this hash on-chain first.'
}
finally {
  $privateKey = $null
  Remove-Variable keyLine -ErrorAction SilentlyContinue
}
