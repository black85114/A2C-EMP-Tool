@echo off
setlocal enabledelayedexpansion



echo ===============================
echo ===                         ===
echo ### Library 替換小程式 v.5 ###
echo ===                  Wayne .ver25-06-19
echo ===============================

REM 清除舊的替換紀錄
set "logfile=%temp%\replaced_files.log"
if exist "%logfile%" del "%logfile%"


::▼------------功能開關 config--------------▼
REM 開啟=Y 關閉=N
set  FTP_LIB=Y
set  Local_LIB=N
set  Auto_ZERO=Y

REM 設定IP及本地LIB地址
set "STATUS_IP=10.1.182.31"
set "LOCAL_ADDR=D:\GIGAIPC_3D\Wayne_LIB"
::▲-----------------------------------------▲

::========== 以下請勿更動 ==================

REM **目標資料夾
set "NAS_IP=ipcfile.gigaipc.intra"
set "target=%~dp0"

REM 設定旗標
set "wayne=n"
set "switch_ip=n"

:SETTING_SOURCE
REM **設定來源**
set "source=\\%NAS_IP%\A2\A2C\ME\0-LIB\000-PC"

REM 是否關閉 FTP LIB功能
if /i "%FTP_LIB%"=="N" (
	set "switch_ip=y"
	goto :LOCAL_FLAG
)

:REPLACE_FILES
echo Library來源=%source%
REM 計算 source 內的檔案數量(作進度條百分比用)
set /a "total=0"

::
echo. 
echo 正在解析目的資料夾...

for /r "%source%" %%a in (*) do (
	set /a "total+=1"
)

REM 如果目標資料夾沒有檔案則結束
if %total%==0 (

    if %switch_ip%==n (
        set "NAS_IP=%STATUS_IP%"
        set switch_ip=y
	    echo.
		echo 找不到地址名稱, 正嘗試改為連線IP...
		echo.
        goto :SETTING_SOURCE
    )
	if %wayne%==y (
		echo 未找到替換檔案...
		echo 請確認 本地 LIB 地址是否正確!!
		goto :RENAME_ASM
	)
    
    echo 未找到替換檔案...
    echo 請確認 NAS IP 是否已變更!!
    pause
    exit /b
)
echo.
::======================================

REM 初始化計數與進度條
set count=0
set /a count_copy=0
set /a barLength=20

REM 開始比對並複製
for /r "%source%" %%a in (*) do (
	::=========100%進度條==============
	cls
    set /a "count+=1"
    set /a "progress=(count*100)/total"

    REM 確保 100% 進度條填滿
    set /a "filled=(count*barLength)/total"
    if !filled! GTR %barLength% set filled=%barLength%
	
    REM 重新建立進度條
    set "bar="
    for /L %%j in (1,1,!filled!) do set "bar=!bar!█"

    REM 填充剩餘的空格（確保總長度 = barLength）
    set /a "remaining=barLength-filled"
    for /L %%j in (1,1,!remaining!) do set "bar=!bar! "	
	echo --------------------  
    echo 正在為您替換檔案...
	echo --------------------
	echo Library 來源:%source%
	echo.   
    echo !progress!%% [!bar!]	
	
	::=========檔案替換程序==============
	set "name=%%~na"
    set "ext=!name:~-4!"

    REM 只處理 .prt 檔案，且 `target` 內有相同檔名時才處理
    if /i "!ext!"==".prt" (

        if exist "!target!!name!*" (
			set /a count_copy=!count_copy!+1

            REM 刪除舊檔案，並複製新檔案
            del "!target!!name!*"
            copy /y "%%a" "!target!"

            REM 檢查檔案是否已在日誌中
            findstr /x "!name!" "%logfile%" >nul 2>&1
            if errorlevel 1 (
                echo !name! >> "%logfile%"
            )		
        )
    )	
)
echo Library 替換完成!! 總共複製了 %count_copy% 個文件。

REM 顯示替換的檔案列表
echo.   
echo 替換的檔案列表：
echo ===============================
type "%logfile%" 
echo ===============================

:LOCAL_FLAG
REM 判斷是否執行過導入 Local LIB
if /i "%wayne%"=="y" (
    goto :RENAME_ASM
)

if /i "%LOCAL_LIB%"=="Y" (
    set "source=%LOCAL_ADDR%"
    set "wayne=y"
    echo 執行 本地端 Library 替換...
    goto :REPLACE_FILES
) else (
    echo 已跳過 本地端 LIB 導入。
    goto :RENAME_ASM
)

:RENAME_ASM
if /i "%Auto_ZERO%"=="Y" (
    echo.
	echo 正在修改 .asm 檔案開頭...

    REM 查找 .asm.* 檔案
    for /f %%f in ('dir /b "%target%\*.asm.*" 2^>nul') do (
        set "oldname=%%f"

        REM 檢查是否已經以 "0-" 開頭
        set "prefix=!oldname:~0,2!"
        if /i "!prefix!"=="0-" (
            echo 檔案 "!oldname!" 已經符合命名規則，無需變更。
        ) else (
            set "newname=0-%%f"
            ren "%target%\!oldname!" "!newname!"
            echo 已重命名: !oldname! → !newname!
	    echo.
	    echo 操作完成
		echo.
        )	
    )
)
pause
REM 自我毀滅程序 b(>w<)
start /b cmd /c del "%~f0"
exit
