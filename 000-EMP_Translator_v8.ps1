# ======================================
# Library 替換小程式 v.8 (EMP.ps1)
# 改編自 Wayne .ver6 -250625-FTP 支援外部配置文件
# ======================================

Write-Host "=====================================" -ForegroundColor Green
Write-Host "===   Library 替換小程式 v.8     ===" -ForegroundColor Green
Write-Host "===   (External Config Support)  ===" -ForegroundColor Green
Write-Host "===========v 2025-06-25 NAS ================" -ForegroundColor Green

#region 自定義進度條函數
function Show-CustomProgress {
    param(
        [int]$Current,
        [int]$Total,
        [string]$Activity = "處理中",
        [int]$BarLength = 30,
        [string]$FilledChar = '■',
        [string]$EmptyChar = '-'
    )
    
    $percentage = [math]::Round(($Current / $Total) * 100, 1)
    $filled = [math]::Round(($Current / $Total) * $BarLength)
    $empty = $BarLength - $filled
    
    $progressBar = ($FilledChar * $filled) + ($EmptyChar * $empty)
    
    # 清除當前行並顯示進度條
    Write-Host "`r$Activity [$progressBar] $percentage% ($Current/$Total)" -NoNewline -ForegroundColor Cyan
    
    # 完成時換行
    if ($Current -eq $Total) {
        Write-Host ""
    }
}
#endregion

#region 配置載入
function Load-Config {
    $ConfigFile = "D:\EMP-Config.ini"
    $Config = @{}
    
    # 預設值
    $Defaults = @{
        'FtpLibEnabled' = $true
        'LocalLibEnabled' = $true
        'CopyMatchingSourceFolders' = $false
        'AutoZeroRenameEnabled' = $true
        'SelfDestructEnabled' = $true
        'NasHostName' = "ipcfile.gigaipc.intra"
        'StatusIP' = "10.1.182.31"
        'LocalLibAddr' = "D:\GIGAIPC_3D\Wayne_LIB"
    }

    if (-not (Test-Path $ConfigFile)) {
        Write-Warning "找不到 Config.ini，使用預設值"
        return $Defaults
    }
    
    try {
        Get-Content $ConfigFile -Encoding UTF8 | ForEach-Object {
            # 跳過註解行和空行
            if ($_ -and -not $_.Trim().StartsWith('#') -and $_.Trim() -ne '') {
                if ($_ -match '^([^=#]+)=(.*)$') {
                    $key = $Matches[1].Trim()
                    $value = $Matches[2].Trim()
                    if ($value -ieq 'true') { 
                        $Config[$key] = $true 
                    }
                    elseif ($value -ieq 'false') { 
                        $Config[$key] = $false 
                    }
                    else { 
                        $Config[$key] = $value 
                    }
                }
            }
        }
        
        # 補充缺失項目
        foreach ($key in $Defaults.Keys) {
            if (-not $Config.ContainsKey($key)) { 
                $Config[$key] = $Defaults[$key] 
            }
        }
        
        Write-Host "✓ 配置載入成功" -ForegroundColor Green
        return $Config
    } 
    catch {
        Write-Warning "配置讀取失敗: $($_.Exception.Message)"
        return $Defaults
    }
}

# 載入配置
$cfg = Load-Config
Write-Host "當前設定: FTP=$($cfg.FtpLibEnabled) | Local=$($cfg.LocalLibEnabled) | 資料夾複製=$($cfg.CopyMatchingSourceFolders)"
#endregion

#region 初始化
# 目標資料夾 (腳本所在的資料夾)
$TargetDir = $PSScriptRoot
if (-not $TargetDir) {
    Write-Warning "無法確定腳本所在目錄 (`$PSScriptRoot)。將使用目前工作目錄。"
    $TargetDir = Get-Location
}

# 確保 TEMP 環境變數存在
if (-not $env:TEMP) {
    $env:TEMP = [System.IO.Path]::GetTempPath()
    if (-not $env:TEMP) {
        $env:TEMP = "C:\Temp"
    }
}

# 確保 TEMP 目錄存在
if (-not (Test-Path $env:TEMP)) {
    try {
        New-Item -ItemType Directory -Path $env:TEMP -Force -ErrorAction Stop | Out-Null
        Write-Host "建立 TEMP 目錄: $env:TEMP" -ForegroundColor Yellow
    } 
    catch {
        Write-Warning "無法建立 TEMP 目錄: $($_.Exception.Message)"
        # 使用腳本所在目錄作為備用
        $env:TEMP = $TargetDir
    }
}

# 紀錄檔路徑
$LogFile = Join-Path $env:TEMP "replaced_files.log"
# 再次確認 LogFile 不為 null
if ([string]::IsNullOrEmpty($LogFile)) {
    $LogFile = Join-Path $TargetDir "replaced_files_ps.log"
    Write-Warning "使用備用日誌路徑: $LogFile"
}
Write-Host "日誌檔案路徑: $LogFile" -ForegroundColor Cyan

# 內部旗標
$SourceAttemptedWithIP = $false

# 清除舊的替換紀錄
if ($LogFile -and (Test-Path $LogFile)) {
    Write-Host "清除舊的紀錄檔: $LogFile"
    Remove-Item $LogFile -Force -ErrorAction SilentlyContinue
}

$TotalCopied = 0
$NasAttempted = $false

if (Test-Path $LogFile) { 
    Remove-Item $LogFile -Force -ErrorAction SilentlyContinue 
}
#endregion

#region 核心函數
function Replace-Files {
    param(
        $Source, 
        $Target, 
        $LogPath, 
        $FolderDest = $null, 
        $CopyFolders = $false
    )
    
    if (-not (Test-Path $Source)) {
        Write-Warning "來源不存在: $Source"
        return @{ Success = $false; Count = 0 }
    }
    
    Write-Host "`n處理來源: $Source" -ForegroundColor Yellow
    
    try {
        # 只取得 .prt 檔案，提高效率
        $files = Get-ChildItem $Source -Recurse -File -Filter "*.prt.*"
        $copied = 0
        $total = $files.Count
        $progressCounter = 0
        
        # 進度條設定
        $ProgressBarLength = 30
        $FilledChar = '■'
        $EmptyChar = '-'
        
        foreach ($file in $files) {
            $progressCounter++
            
            # 每處理 5 個檔案才更新一次進度條
            if ($progressCounter % 5 -eq 0 -or $progressCounter -eq $total) {
                Show-CustomProgress -Current $progressCounter -Total $total -Activity "處理 .prt 檔案" -BarLength $ProgressBarLength -FilledChar $FilledChar -EmptyChar $EmptyChar
            }
            
            $targetPattern = Join-Path $Target "$($file.BaseName)*"
            if (Test-Path $targetPattern) {
                # 刪除舊檔案
                Get-ChildItem $targetPattern | Remove-Item -Force -ErrorAction SilentlyContinue
                
                # 複製新檔案
                $newPath = Join-Path $Target $file.Name
                Copy-Item $file.FullName $newPath -Force
                $copied++
                
                # 批次寫入日誌，減少 I/O
                if (-not $logBuffer) { $logBuffer = @() }
                $logBuffer += $file.BaseName
                
                # 複製同名資料夾 (如果啟用)
                if ($CopyFolders -and $FolderDest) {
                    $sourceFolder = Join-Path $Source $file.BaseName
                    if (Test-Path $sourceFolder -PathType Container) {
                        if (-not (Test-Path $FolderDest)) { 
                            New-Item $FolderDest -ItemType Directory -Force | Out-Null 
                        }
                        Copy-Item $sourceFolder $FolderDest -Recurse -Force -ErrorAction SilentlyContinue
                    }
                }
            }
        }
        

        
        # 批次寫入日誌
        if ($logBuffer -and $logBuffer.Count -gt 0) {
            $logBuffer | Add-Content $LogPath -Encoding UTF8
        }
        
        Write-Host "✓ 完成，複製了 $copied 個檔案" -ForegroundColor Green
        return @{ Success = $true; Count = $copied }
        
    } 
    catch {
        Write-Warning "處理時發生錯誤: $($_.Exception.Message)"
        return @{ Success = $false; Count = 0 }
    }
}
#endregion

#region 主要處理流程
# 準備資料夾複製路徑
$baseDir = $null
$ftpDest = $null
$localDest = $null

if ($cfg.CopyMatchingSourceFolders) {
    $baseDir = Join-Path $TargetDir 'base'
    if (-not (Test-Path $baseDir)) { 
        New-Item $baseDir -ItemType Directory -Force | Out-Null 
    }
    $ftpDest = Join-Path $baseDir 'FTP'
    $localDest = Join-Path $baseDir 'LOCAL'
}

# 處理 NAS/FTP Library
if ($cfg.FtpLibEnabled) {
    Write-Host "`n=== 處理 NAS Library ===" -ForegroundColor Cyan
    $nasSource = "\\$($cfg.NasHostName)\a2\A2C\ME\0-LIB\000-PC"
    $result = Replace-Files $nasSource $TargetDir $LogFile $ftpDest $cfg.CopyMatchingSourceFolders
    
    if ($result.Success) {
        $TotalCopied += $result.Count
    } 
    else {
        # 嘗試 IP 連線
        Write-Host "嘗試 IP 連線..." -ForegroundColor Yellow
        $nasSource = "\\$($cfg.StatusIP)\a2\A2C\ME\0-LIB\000-PC"
        $result = Replace-Files $nasSource $TargetDir $LogFile $ftpDest $cfg.CopyMatchingSourceFolders
        if ($result.Success) { 
            $TotalCopied += $result.Count 
        }
    }
}

# 處理本地 Library
if ($cfg.LocalLibEnabled) {
    Write-Host "`n=== 處理本地 Library ===" -ForegroundColor Cyan
    $result = Replace-Files $cfg.LocalLibAddr $TargetDir $LogFile $localDest $cfg.CopyMatchingSourceFolders
    if ($result.Success) { 
        $TotalCopied += $result.Count 
    }
}
#endregion

#region .asm 檔案重新命名
if ($cfg.AutoZeroRenameEnabled) {
    Write-Host "`n=== 處理 .asm 檔案重新命名 ===" -ForegroundColor Cyan
    $asmFiles = Get-ChildItem $TargetDir -Filter "*.asm.*" -File
    $renamed = 0
    
    foreach ($file in $asmFiles) {
        if (-not $file.Name.StartsWith("0-")) {
            $newName = "0-$($file.Name)"
            Rename-Item $file.FullName $newName -ErrorAction SilentlyContinue
            $renamed++
        }
    }
    
    if ($renamed -gt 0) {
        Write-Host "✓ 重新命名了 $renamed 個 .asm 檔案" -ForegroundColor Green
    } 
    else {
        Write-Host "沒有需要重新命名的 .asm 檔案" -ForegroundColor Gray
    }
}
#endregion

#region 結果顯示與清理
Write-Host "`n===============================" -ForegroundColor Cyan
Write-Host "===        執行完成        ===" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan
Write-Host "總共處理了 $TotalCopied 個 .prt 檔案"

if (Test-Path $LogFile) {
    $replacedFiles = Get-Content $LogFile -ErrorAction SilentlyContinue
    if ($replacedFiles) {
        Write-Host "`n替換的檔案:"
        $replacedFiles | ForEach-Object { 
            Write-Host "  - $_" 
        }
    }
}

# 自動刪除腳本
if ($cfg.SelfDestructEnabled) {
    Write-Host "`n腳本將在 3 秒後自動刪除..." -ForegroundColor Yellow
    Start-Sleep 3
    try {
        Remove-Item $PSCommandPath -Force
        exit
    } 
    catch {
        Write-Warning "無法刪除腳本: $($_.Exception.Message)"
    }
}

Read-Host "`n按 Enter 結束"
#endregion