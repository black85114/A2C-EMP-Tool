@echo off
setlocal enabledelayedexpansion



echo ===============================
echo ===                         ===
echo ### Library �����p�{�� v.5 ###
echo ===                  Wayne .ver25-06-19
echo ===============================

REM �M���ª���������
set "logfile=%temp%\replaced_files.log"
if exist "%logfile%" del "%logfile%"


::��------------�\��}�� config--------------��
REM �}��=Y ����=N
set  FTP_LIB=Y
set  Local_LIB=N
set  Auto_ZERO=Y

REM �]�wIP�Υ��aLIB�a�}
set "STATUS_IP=10.1.182.31"
set "LOCAL_ADDR=D:\GIGAIPC_3D\Wayne_LIB"
::��-----------------------------------------��

::========== �H�U�Фŧ�� ==================

REM **�ؼи�Ƨ�
set "NAS_IP=ipcfile.gigaipc.intra"
set "target=%~dp0"

REM �]�w�X��
set "wayne=n"
set "switch_ip=n"

:SETTING_SOURCE
REM **�]�w�ӷ�**
set "source=\\%NAS_IP%\A2\A2C\ME\0-LIB\000-PC"

REM �O�_���� FTP LIB�\��
if /i "%FTP_LIB%"=="N" (
	set "switch_ip=y"
	goto :LOCAL_FLAG
)

:REPLACE_FILES
echo Library�ӷ�=%source%
REM �p�� source �����ɮ׼ƶq(�@�i�ױ��ʤ����)
set /a "total=0"

::
echo. 
echo ���b�ѪR�ت���Ƨ�...

for /r "%source%" %%a in (*) do (
	set /a "total+=1"
)

REM �p�G�ؼи�Ƨ��S���ɮ׫h����
if %total%==0 (

    if %switch_ip%==n (
        set "NAS_IP=%STATUS_IP%"
        set switch_ip=y
	    echo.
		echo �䤣��a�}�W��, �����էאּ�s�uIP...
		echo.
        goto :SETTING_SOURCE
    )
	if %wayne%==y (
		echo ���������ɮ�...
		echo �нT�{ ���a LIB �a�}�O�_���T!!
		goto :RENAME_ASM
	)
    
    echo ���������ɮ�...
    echo �нT�{ NAS IP �O�_�w�ܧ�!!
    pause
    exit /b
)
echo.
::======================================

REM ��l�ƭp�ƻP�i�ױ�
set count=0
set /a count_copy=0
set /a barLength=20

REM �}�l���ýƻs
for /r "%source%" %%a in (*) do (
	::=========100%�i�ױ�==============
	cls
    set /a "count+=1"
    set /a "progress=(count*100)/total"

    REM �T�O 100% �i�ױ���
    set /a "filled=(count*barLength)/total"
    if !filled! GTR %barLength% set filled=%barLength%
	
    REM ���s�إ߶i�ױ�
    set "bar="
    for /L %%j in (1,1,!filled!) do set "bar=!bar!�i"

    REM ��R�Ѿl���Ů�]�T�O�`���� = barLength�^
    set /a "remaining=barLength-filled"
    for /L %%j in (1,1,!remaining!) do set "bar=!bar! "	
	echo --------------------  
    echo ���b���z�����ɮ�...
	echo --------------------
	echo Library �ӷ�:%source%
	echo.   
    echo !progress!%% [!bar!]	
	
	::=========�ɮ״����{��==============
	set "name=%%~na"
    set "ext=!name:~-4!"

    REM �u�B�z .prt �ɮסA�B `target` �����ۦP�ɦW�ɤ~�B�z
    if /i "!ext!"==".prt" (

        if exist "!target!!name!*" (
			set /a count_copy=!count_copy!+1

            REM �R�����ɮסA�ýƻs�s�ɮ�
            del "!target!!name!*"
            copy /y "%%a" "!target!"

            REM �ˬd�ɮ׬O�_�w�b��x��
            findstr /x "!name!" "%logfile%" >nul 2>&1
            if errorlevel 1 (
                echo !name! >> "%logfile%"
            )		
        )
    )	
)
echo Library ��������!! �`�@�ƻs�F %count_copy% �Ӥ��C

REM ��ܴ������ɮצC��
echo.   
echo �������ɮצC��G
echo ===============================
type "%logfile%" 
echo ===============================

:LOCAL_FLAG
REM �P�_�O�_����L�ɤJ Local LIB
if /i "%wayne%"=="y" (
    goto :RENAME_ASM
)

if /i "%LOCAL_LIB%"=="Y" (
    set "source=%LOCAL_ADDR%"
    set "wayne=y"
    echo ���� ���a�� Library ����...
    goto :REPLACE_FILES
) else (
    echo �w���L ���a�� LIB �ɤJ�C
    goto :RENAME_ASM
)

:RENAME_ASM
if /i "%Auto_ZERO%"=="Y" (
    echo.
	echo ���b�ק� .asm �ɮ׶}�Y...

    REM �d�� .asm.* �ɮ�
    for /f %%f in ('dir /b "%target%\*.asm.*" 2^>nul') do (
        set "oldname=%%f"

        REM �ˬd�O�_�w�g�H "0-" �}�Y
        set "prefix=!oldname:~0,2!"
        if /i "!prefix!"=="0-" (
            echo �ɮ� "!oldname!" �w�g�ŦX�R�W�W�h�A�L���ܧ�C
        ) else (
            set "newname=0-%%f"
            ren "%target%\!oldname!" "!newname!"
            echo �w���R�W: !oldname! �� !newname!
	    echo.
	    echo �ާ@����
		echo.
        )	
    )
)
pause
REM �ۧڷ����{�� b(>w<)
start /b cmd /c del "%~f0"
exit
