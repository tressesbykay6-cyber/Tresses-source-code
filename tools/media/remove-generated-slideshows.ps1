$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$slideshows = [IO.Path]::GetFullPath((Join-Path $workspace 'public\media\slideshows'))
$mediaRoot = [IO.Path]::GetFullPath((Join-Path $workspace 'public\media'))
if (-not $slideshows.StartsWith($mediaRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw 'Unsafe slideshow directory.' }

Get-ChildItem -LiteralPath $slideshows -File -Filter '*.mp4' | Remove-Item -Force
