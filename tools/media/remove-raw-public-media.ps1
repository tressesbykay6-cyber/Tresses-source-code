$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$publicRoot = [IO.Path]::GetFullPath((Join-Path $workspace 'public'))
$rawDirectories = @(
  [IO.Path]::GetFullPath((Join-Path $publicRoot 'gallery')),
  [IO.Path]::GetFullPath((Join-Path $publicRoot 'videos\gallery'))
)
$rawFiles = @(
  [IO.Path]::GetFullPath((Join-Path $publicRoot 'videos\intro.mp4')),
  [IO.Path]::GetFullPath((Join-Path $publicRoot 'videos\video1.mp4')),
  [IO.Path]::GetFullPath((Join-Path $publicRoot 'videos\video2.mp4')),
  [IO.Path]::GetFullPath((Join-Path $publicRoot 'videos\video3.mp4'))
)

foreach ($directory in $rawDirectories) {
  if (-not $directory.StartsWith($publicRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe directory: $directory" }
  Get-ChildItem -LiteralPath $directory -File | Remove-Item -Force
}
foreach ($file in $rawFiles) {
  if (-not $file.StartsWith($publicRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe file: $file" }
  if (Test-Path -LiteralPath $file) { Remove-Item -LiteralPath $file -Force }
}
