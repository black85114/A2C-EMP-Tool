@echo off
setlocal enabledelayedexpansion

REM --- 設定 ---
set "desiredPolicy=RemoteSigned"

REM --- 檢查是否需要變更策略 ---
echo [*] Checking PowerShell Execution Policy for Current User...
for /f "delims=" %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ExecutionPolicy -Scope CurrentUser"') do (
    set "currentPolicy=%%P"
)

echo    Current Policy: !currentPolicy!

if /I "!currentPolicy!"=="%desiredPolicy%" (
    echo [*] Execution Policy is already set to '%desiredPolicy%'. No action needed.
    goto End
) else (
    echo [*] Execution Policy needs to be changed from "!currentPolicy!" to '%desiredPolicy%'.
)

REM --- 檢查管理員權限 ---
echo [*] Checking for Administrator privileges...
net session >nul 2>&1
if %errorLevel% == 0 (
    echo    Running with Administrator privileges.
    goto SetPolicy
) else (
    echo    Not running as Administrator. Attempting to elevate...
    goto Elevate
)

:Elevate
REM --- 嘗試提權重新執行 ---
REM 使用 PowerShell 的 Start-Process 以管理員身分重新執行此 .bat 檔案
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '%~f0' -Verb RunAs"

REM 檢查提權是否啟動 (注意：這不保證使用者點了 "是")
if %errorLevel% NEQ 0 (
 echo [!] Failed to request elevation. Please run this script manually as Administrator.
 goto End
)

echo    Elevation requested. The script will exit now, and potentially restart with Admin rights if approved.
goto End

:SetPolicy
REM --- 只有管理員能執行到這裡 ---
echo [*] Attempting to set Execution Policy to '%desiredPolicy%'...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy %desiredPolicy% -Scope CurrentUser -Force"

REM --- 驗證變更 ---
echo [*] Verifying the change...
set "newPolicy="
for /f "delims=" %%P in ('powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ExecutionPolicy -Scope CurrentUser"') do (
    set "newPolicy=%%P"
)
echo    New Policy: !newPolicy!

if /I "!newPolicy!"=="%desiredPolicy%" (
    echo [+] Execution Policy successfully set to '%desiredPolicy%'.
) else (
    echo [!] Failed to set Execution Policy. It might be blocked by Group Policy or another issue.
)

:End
echo.
echo Script finished. Press any key to exit.
pause >nul
endlocal
REM 自我毀滅程序 b(>w<)
start /b cmd /c del "%~f0"
exit /b
