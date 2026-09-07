$ErrorActionPreference = "Stop"

Write-Host "Checking Docker..."
docker info *> $null

$manualContainer = docker ps -a --filter "name=^/healthcare-azurite$" --format "{{.Names}}|{{.Status}}|{{.Ports}}"
if ($manualContainer) {
    Write-Warning "Existing manual container detected: $manualContainer"
    $running = docker ps --filter "name=^/healthcare-azurite$" --format "{{.Names}}"
    if ($running) {
        throw "The manual healthcare-azurite container is running. Stop it before Compose so port 10000 and the existing volume remain untouched."
    }
}

$volume = docker volume ls --filter "name=^healthcare_azurite_data$" --format "{{.Name}}"
if ($volume) {
    Write-Host "Azurite volume found and will be reused: $volume"
} else {
    Write-Host "Azurite volume does not exist; Compose will create it."
}

$portListeners = Get-NetTCPConnection -LocalPort 10000,5432 -State Listen -ErrorAction SilentlyContinue
if ($portListeners) {
    $portListeners | Format-Table LocalAddress, LocalPort, OwningProcess
    throw "A required localhost port is already in use. Resolve the collision before starting Compose."
}

Write-Host "Preflight passed. Run: docker compose up -d --wait"
