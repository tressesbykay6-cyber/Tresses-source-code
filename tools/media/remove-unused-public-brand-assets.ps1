$ErrorActionPreference = 'Stop'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$publicRoot = [IO.Path]::GetFullPath((Join-Path $workspace 'public'))
$unused = @(
  'Android_mobile_app_icon_design_202608061021.jpeg',
  'Dark_themed_logo_design_2K_202608061034.jpeg',
  'Horizontal_banner_logo_layout_2K_202608061023.jpeg',
  'image.png_2K_202608061018.jpeg',
  'Logo_features_woman_silhouette_2K_202608061023.jpeg',
  'Logo_with_text_2K_202608061034.jpeg',
  'Mobile_app_splash_screen_2K_202608061034.jpeg',
  'Open_Graph_sharing_image_2K_202608061024.jpeg'
)
foreach ($name in $unused) {
  $target = [IO.Path]::GetFullPath((Join-Path $publicRoot $name))
  if (-not $target.StartsWith($publicRoot, [System.StringComparison]::OrdinalIgnoreCase)) { throw "Unsafe file: $target" }
  if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Force }
}
