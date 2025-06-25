@echo off
setlocal enabledelayedexpansion

REM --- �]�w ---
set "desiredPolicy=RemoteSigned"

REM --- �ˬd�O�_�ݭn�ܧ󵦲� ---
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

REM --- �ˬd�޲z���v�� ---
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
REM --- ���մ��v���s���� ---
REM �ϥ� PowerShell �� Start-Process �H�޲z���������s���榹 .bat �ɮ�
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process '%~f0' -Verb RunAs"

REM �ˬd���v�O�_�Ұ� (�`�N�G�o���O�ҨϥΪ��I�F "�O")
if %errorLevel% NEQ 0 (
 echo [!] Failed to request elevation. Please run this script manually as Administrator.
 goto End
)

echo    Elevation requested. The script will exit now, and potentially restart with Admin rights if approved.
goto End

:SetPolicy
REM --- �u���޲z��������o�� ---
echo [*] Attempting to set Execution Policy to '%desiredPolicy%'...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy %desiredPolicy% -Scope CurrentUser -Force"

REM --- �����ܧ� ---
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
REM �ۧڷ����{�� b(>w<)
start /b cmd /c del "%~f0"
exit /b
