Add-Type -AssemblyName System.Drawing

$baseDir = "C:\Users\admin\Desktop\Desktop\hostel_mess"
$htmlPath = "$baseDir\client\public\export_icon.html"
$tempShot = "$baseDir\client\public\temp_raw.png"

# 1. Capture 256x256 with Chrome headless
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$args = @(
    "--headless=new",
    "--disable-gpu",
    "--default-background-color=00000000",
    "--window-size=600,600",
    "--screenshot=$tempShot",
    "file:///$($htmlPath.Replace('\', '/'))"
)

Start-Process -FilePath $chrome -ArgumentList $args -Wait

if (!(Test-Path $tempShot)) {
    Write-Error "Screenshot was not generated!"
    exit 1
}

# 2. Load and crop top-left 256x256
$rawBmp = [System.Drawing.Bitmap]::FromFile($tempShot)
$cropRect = New-Object System.Drawing.Rectangle(0, 0, 256, 256)
$srcBmp = $rawBmp.Clone($cropRect, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$rawBmp.Dispose()
Remove-Item -Force $tempShot

# Helper function to resize
function Resize-Bitmap([System.Drawing.Bitmap]$source, [int]$size) {
    $target = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($target)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($source, 0, 0, $size, $size)
    $g.Dispose()
    return $target
}

$bmp16 = Resize-Bitmap $srcBmp 16
$bmp32 = Resize-Bitmap $srcBmp 32
$bmp48 = Resize-Bitmap $srcBmp 48
$bmp180 = Resize-Bitmap $srcBmp 180
$bmp192 = Resize-Bitmap $srcBmp 192

# Save individual PNGs
$srcBmp.Save("$baseDir\client\public\icon-256.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Save("$baseDir\client\public\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("$baseDir\client\public\apple-touch-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp180.Save("$baseDir\client\src\app\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp32.Save("$baseDir\client\public\icon-32.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp16.Save("$baseDir\client\public\icon-16.png", [System.Drawing.Imaging.ImageFormat]::Png)

# 3. Create ICO container
function Write-IcoFile([string]$outPath, [System.Drawing.Bitmap[]]$images) {
    $msArray = @()
    foreach ($img in $images) {
        $ms = New-Object System.IO.MemoryStream
        $img.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
        $msArray += $ms
    }

    $fs = [System.IO.File]::Create($outPath)
    $bw = New-Object System.IO.BinaryWriter($fs)

    # Header
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$msArray.Count)

    $offset = 6 + (16 * $msArray.Count)

    for ($i = 0; $i -lt $msArray.Count; $i++) {
        $w = $images[$i].Width
        $h = $images[$i].Height
        $len = [uint32]$msArray[$i].Length

        $bw.Write([byte]$(if ($w -ge 256) { 0 } else { $w }))
        $bw.Write([byte]$(if ($h -ge 256) { 0 } else { $h }))
        $bw.Write([byte]0)
        $bw.Write([byte]0)
        $bw.Write([uint16]1)
        $bw.Write([uint16]32)
        $bw.Write($len)
        $bw.Write([uint32]$offset)

        $offset += $len
    }

    for ($i = 0; $i -lt $msArray.Count; $i++) {
        $bw.Write($msArray[$i].ToArray())
        $msArray[$i].Dispose()
    }

    $bw.Close()
    $fs.Close()
}

$icoImages = @($bmp16, $bmp32, $bmp48)
Write-IcoFile "$baseDir\client\src\app\favicon.ico" $icoImages
Write-IcoFile "$baseDir\client\public\favicon.ico" $icoImages

$bmp16.Dispose()
$bmp32.Dispose()
$bmp48.Dispose()
$bmp180.Dispose()
$bmp192.Dispose()
$srcBmp.Dispose()

Write-Host "All icons generated successfully!"
