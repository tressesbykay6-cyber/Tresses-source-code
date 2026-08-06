param(
  [switch]$PurgeDuplicates
)

$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$sourceRoot = [IO.Path]::GetFullPath((Join-Path $workspace 'downloads\tresses_by__kay'))
$galleryOutput = [IO.Path]::GetFullPath((Join-Path $workspace 'public\media\gallery'))
$mediaRoot = [IO.Path]::GetFullPath((Join-Path $workspace 'public\media'))

if (-not $sourceRoot.StartsWith($workspace, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe source path.' }
if (-not $galleryOutput.StartsWith($mediaRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe output path.' }

$files = Get-ChildItem -LiteralPath $sourceRoot -File
$hashes = $files | Get-FileHash -Algorithm SHA256
$hashCount = @{}
$hashByPath = @{}
$hashes | Group-Object Hash | ForEach-Object { $hashCount[$_.Name] = $_.Count }
$hashes | ForEach-Object { $hashByPath[$_.Path] = $_.Hash }

# The scraper captured Instagram navigation imagery on video pages. Assets duplicated
# more than four times are page chrome, not post media, and are excluded from covers.
$postMedia = @()
$files | Group-Object { $_.BaseName -replace '_\d+$', '' } | ForEach-Object {
  $usable = $_.Group | Where-Object { $hashCount[$hashByPath[$_.FullName]] -le 4 }
  $photo = $usable | Where-Object { $_.Extension -in '.jpg', '.jpeg', '.png', '.webp' } | Sort-Object Length -Descending | Select-Object -First 1
  $video = $usable | Where-Object { $_.Extension -eq '.mp4' } | Sort-Object Length -Descending | Select-Object -First 1
  $choice = if ($photo) { $photo } else { $video }
  if (-not $choice) { throw "No usable media for post $($_.Name)." }
  $postMedia += [PSCustomObject]@{ Post = $_.Name; Source = $choice.FullName; Extension = $choice.Extension }
}

if ($postMedia.Count -ne 296) { throw "Expected 296 valid Tresses posts; found $($postMedia.Count)." }

$duplicates = @()
$hashes | Group-Object Hash | Where-Object Count -gt 1 | ForEach-Object {
  $duplicates += $_.Group | Sort-Object Path | Select-Object -Skip 1 | Select-Object -ExpandProperty Path
}
if ($PurgeDuplicates) {
  foreach ($path in $duplicates) {
    if (-not $path.StartsWith($sourceRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe delete target: $path" }
    Remove-Item -LiteralPath $path -Force
  }
}

# Rebuild the cover list after duplicate cleanup. A post can share a byte-identical
# asset with another post; this pass always uses the surviving canonical file.
$files = Get-ChildItem -LiteralPath $sourceRoot -File
$hashes = $files | Get-FileHash -Algorithm SHA256
$hashCount = @{}
$hashByPath = @{}
$hashes | Group-Object Hash | ForEach-Object { $hashCount[$_.Name] = $_.Count }
$hashes | ForEach-Object { $hashByPath[$_.Path] = $_.Hash }
$postMedia = @()
$files | Group-Object { $_.BaseName -replace '_\d+$', '' } | ForEach-Object {
  $usable = $_.Group | Where-Object { $hashCount[$hashByPath[$_.FullName]] -le 4 }
  $photo = $usable | Where-Object { $_.Extension -in '.jpg', '.jpeg', '.png', '.webp' } | Sort-Object Length -Descending | Select-Object -First 1
  $video = $usable | Where-Object { $_.Extension -eq '.mp4' } | Sort-Object Length -Descending | Select-Object -First 1
  $choice = if ($photo) { $photo } else { $video }
  if (-not $choice) { throw "No usable media remains for post $($_.Name)." }
  $postMedia += [PSCustomObject]@{ Post = $_.Name; Source = $choice.FullName; Extension = $choice.Extension }
}
if ($postMedia.Count -ne 296) { throw "Expected 296 valid Tresses posts after cleanup; found $($postMedia.Count)." }

Get-ChildItem -LiteralPath $galleryOutput -File | Remove-Item -Force
$ffmpeg = 'C:\ffmpeg\ffmpeg.exe'
foreach ($item in $postMedia | Sort-Object Post) {
  $output = Join-Path $galleryOutput ($item.Post + '.webp')
  if ($item.Extension -eq '.mp4') {
    & $ffmpeg -hide_banner -loglevel error -ss 0.5 -i $item.Source -frames:v 1 -vf 'scale=1200:1200:force_original_aspect_ratio=decrease,eq=brightness=-0.045:saturation=0.92:contrast=1.04' -c:v libwebp -quality 76 -compression_level 6 $output -y
  } else {
    & $ffmpeg -hide_banner -loglevel error -i $item.Source -vf 'scale=1200:1200:force_original_aspect_ratio=decrease,eq=brightness=-0.045:saturation=0.92:contrast=1.04' -c:v libwebp -quality 76 -compression_level 6 $output -y
  }
  if ($LASTEXITCODE -ne 0) { throw "Failed to convert post $($item.Post)." }
}

[PSCustomObject]@{
  posts = $postMedia.Count
  duplicatesRemoved = if ($PurgeDuplicates) { $duplicates.Count } else { 0 }
  sourceFilesRemaining = (Get-ChildItem -LiteralPath $sourceRoot -File).Count
  galleryAssets = (Get-ChildItem -LiteralPath $galleryOutput -File).Count
  galleryBytes = (Get-ChildItem -LiteralPath $galleryOutput -File | Measure-Object -Property Length -Sum).Sum
} | ConvertTo-Json
