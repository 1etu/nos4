Add-Type -AssemblyName System.Drawing
$project = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$output = Join-Path $project '.camera-test-output'
New-Item -ItemType Directory -Path $output -Force | Out-Null
foreach ($number in 1..3) {
    $name = "photo-$number"
    $source = [Drawing.Image]::FromFile((Join-Path $project "assets/media/$name.jpg"))
    $bitmap = New-Object Drawing.Bitmap($source.Width, $source.Height, [Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [Drawing.Graphics]::FromImage($bitmap)
    $graphics.DrawImage($source, 0, 0, $source.Width, $source.Height)
    $bitmap.Save((Join-Path $output "$name.bmp"), [Drawing.Imaging.ImageFormat]::Bmp)
    $graphics.Dispose()
    $bitmap.Dispose()
    & bun (Join-Path $PSScriptRoot 'render.ts') (Join-Path $output "$name.bmp")
    if ($LASTEXITCODE -ne 0) { throw 'The effect test failed.' }
    $effect = [Drawing.Image]::FromFile((Join-Path $output "$name-effect.bmp"))
    $comparison = New-Object Drawing.Bitmap(($source.Width * 2), ($source.Height + 40))
    $graphics = [Drawing.Graphics]::FromImage($comparison)
    $graphics.Clear([Drawing.Color]::Black)
    $font = New-Object Drawing.Font('Arial', 16)
    $graphics.DrawString('Original', $font, [Drawing.Brushes]::White, 12, 8)
    $graphics.DrawString('CameraKit effect', $font, [Drawing.Brushes]::White, ($source.Width + 12), 8)
    $graphics.DrawImage($source, 0, 40, $source.Width, $source.Height)
    $graphics.DrawImage($effect, $source.Width, 40, $source.Width, $source.Height)
    $comparison.Save((Join-Path $output "$name-comparison.png"), [Drawing.Imaging.ImageFormat]::Png)
    $font.Dispose()
    $graphics.Dispose()
    $comparison.Dispose()
    $effect.Dispose()
    $source.Dispose()
}
