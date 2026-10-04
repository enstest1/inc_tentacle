param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('USDC','USDCe')]
  [string]$Token,
  [switch]$Broadcast
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$rpc = 'https://rpc-gel.inkonchain.com'
$wallet = '0xA634BcD929951E3f510B96984aeaEDAF06af8e02'
$tokens = @{
  USDC  = '0x2D270e6886d130D724215A266106e6832161EAEd'
  USDCe = '0xF1815bd50389c46847f0Bda824eC8da914045D14'
}
$tokenAddress = $tokens[$Token]
$forge = "$env:USERPROFILE\.foundry\bin\forge.exe"
if (!(Test-Path $forge)) { throw "Forge not found: $forge" }

function Invoke-Rpc([string]$Method, [object[]]$Params) {
  $body = @{ jsonrpc='2.0'; id=1; method=$Method; params=$Params } | ConvertTo-Json -Compress
  Invoke-RestMethod -Method Post -Uri $rpc -ContentType 'application/json' -Body $body
}
$chainId = [Convert]::ToInt64((Invoke-Rpc 'eth_chainId' @()).result, 16)
if ($chainId -ne 57073) { throw "Wrong chain: $chainId" }

$balanceHex = (Invoke-Rpc 'eth_getBalance' @($wallet, 'latest')).result
$balanceWei = [System.Numerics.BigInteger]::Parse($balanceHex.Substring(2), 'AllowHexSpecifier')
$balanceEth = [decimal]$balanceWei / 1e18
if ($balanceWei -le 0) { throw 'Deployment wallet has no Ink mainnet ETH.' }

$code = (Invoke-Rpc 'eth_getCode' @($tokenAddress, 'latest')).result
if (!$code -or $code -eq '0x') { throw "Token is not a contract: $tokenAddress" }

Write-Host "Ink mainnet chain: $chainId"
Write-Host "Deployment wallet: $wallet"
Write-Host "Balance: $balanceEth ETH"
Write-Host "Token: $Token $tokenAddress"
Write-Host "Mode: $(if($Broadcast){'BROADCAST'}else{'SIMULATION'})"

if ($Broadcast) {
  if ((git status --porcelain)) { throw 'Git working tree must be clean before mainnet broadcast.' }
  $confirmation = Read-Host 'Type YES_I_HAVE_READ_THE_CHECKLIST to authorize this mainnet deployment'
  if ($confirmation -ne 'YES_I_HAVE_READ_THE_CHECKLIST') { throw 'Mainnet deployment not authorized.' }
}
$envFile = Join-Path $root '.env.local'
$keyLine = Get-Content $envFile | Where-Object { $_ -match '^DEPLOYER_PRIVATE_KEY=' } | Select-Object -First 1
if (!$keyLine) { throw 'DEPLOYER_PRIVATE_KEY missing from .env.local' }

try {
  $env:DEPLOYER_PRIVATE_KEY = ($keyLine -split '=',2)[1].Trim()
  $env:MAINNET_DEPLOYMENT_CONFIRMED = 'YES_I_HAVE_READ_THE_CHECKLIST'
  $env:MAINNET_TOKEN_ADDRESS = $tokenAddress
  Set-Location (Join-Path $root 'contracts')

  $args = @('script','script\DeployMainnet.s.sol:DeployMainnet','--rpc-url',$rpc,'-vv')
  if ($Broadcast) { $args += '--broadcast' }
  & $forge @args
  $exit = $LASTEXITCODE

  if ($exit -ne 0) {
    Write-Warning 'Forge returned non-zero. Do NOT retry automatically; inspect contracts\broadcast first because Ink receipts may include unsupported fields after a successful broadcast.'
    exit $exit
  }
}
finally {
  Remove-Item Env:DEPLOYER_PRIVATE_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:MAINNET_DEPLOYMENT_CONFIRMED -ErrorAction SilentlyContinue
  Remove-Item Env:MAINNET_TOKEN_ADDRESS -ErrorAction SilentlyContinue
  Set-Location $root
}
