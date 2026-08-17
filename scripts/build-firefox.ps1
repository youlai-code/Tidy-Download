param(
    [string]$AddonId = "tidydownload@downloadcrx.local",
    [string]$OutputRoot = "dist/firefox",
    [switch]$SkipArchive
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$sourceManifestPath = Join-Path $projectRoot "manifest.json"
$firefoxManifestTemplatePath = Join-Path $projectRoot "manifests/manifest.firefox.json"
$outputRootPath = Join-Path $projectRoot $OutputRoot
$packageRootPath = Join-Path $outputRootPath "package"

if (-not (Test-Path $sourceManifestPath)) {
    throw "Cannot find source manifest at $sourceManifestPath"
}

if (-not (Test-Path $firefoxManifestTemplatePath)) {
    throw "Cannot find Firefox manifest template at $firefoxManifestTemplatePath"
}

$sourceManifest = Get-Content $sourceManifestPath -Raw | ConvertFrom-Json
$version = [string]$sourceManifest.version
$archivePath = Join-Path $outputRootPath ("TidyDownload-firefox-{0}.zip" -f $version)
$xpiPath = Join-Path $outputRootPath ("TidyDownload-firefox-{0}.xpi" -f $version)

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$filesToCopy = @(
    "background.js",
    "popup.html",
    "popup.js",
    "options.html",
    "options.js",
    "style.css"
)

$directoriesToCopy = @(
    "icons",
    "_locales"
)

New-Item -ItemType Directory -Path $outputRootPath -Force | Out-Null

if (Test-Path $packageRootPath) {
    Remove-Item $packageRootPath -Recurse -Force
}

New-Item -ItemType Directory -Path $packageRootPath -Force | Out-Null

foreach ($relativePath in $filesToCopy) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path $sourcePath)) {
        throw "Missing required file: $relativePath"
    }

    Copy-Item $sourcePath -Destination (Join-Path $packageRootPath $relativePath) -Force
}

foreach ($relativePath in $directoriesToCopy) {
    $sourcePath = Join-Path $projectRoot $relativePath
    if (-not (Test-Path $sourcePath)) {
        throw "Missing required directory: $relativePath"
    }

    Copy-Item $sourcePath -Destination (Join-Path $packageRootPath $relativePath) -Recurse -Force
}

$manifestTemplate = Get-Content $firefoxManifestTemplatePath -Raw
$firefoxManifest = $manifestTemplate.Replace("__VERSION__", $version).Replace("__ADDON_ID__", $AddonId)
$firefoxManifest | Set-Content (Join-Path $packageRootPath "manifest.json") -Encoding utf8

if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
}

if (Test-Path $xpiPath) {
    Remove-Item $xpiPath -Force
}

if (-not $SkipArchive) {
    $zip = [System.IO.Compression.ZipFile]::Open($archivePath, [System.IO.Compression.ZipArchiveMode]::Create)
    try {
        $packageRootFullPath = [System.IO.Path]::GetFullPath($packageRootPath)
        $files = Get-ChildItem -Path $packageRootPath -Recurse -File
        foreach ($file in $files) {
            $relativePath = $file.FullName.Substring($packageRootFullPath.Length).TrimStart('\', '/')
            $entryName = $relativePath -replace '\\', '/'
            $entry = $zip.CreateEntry($entryName, [System.IO.Compression.CompressionLevel]::Optimal)
            $entryStream = $entry.Open()
            try {
                $fileStream = [System.IO.File]::OpenRead($file.FullName)
                try {
                    $fileStream.CopyTo($entryStream)
                }
                finally {
                    $fileStream.Dispose()
                }
            }
            finally {
                $entryStream.Dispose()
            }
        }
    }
    finally {
        $zip.Dispose()
    }

    Copy-Item $archivePath -Destination $xpiPath -Force
}

Write-Host "Firefox package directory: $packageRootPath"
if (-not $SkipArchive) {
    Write-Host "Firefox archive: $archivePath"
    Write-Host "Firefox XPI: $xpiPath"
}
