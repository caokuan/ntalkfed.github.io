@ECHO OFF

:start
CLS
TITLE Ntalker�ű�ѹ��
goto release

:release
REM ============================================================START
time>js/version.txt
time>respack/version.txt

if not exist js\min md js\min
echo ѹ��Ŀ¼�������

echo ��ʼѹ���ű�����ȴ�......
for /f %%i in ('dir /a-d /b .\js\*.js') do (
if not %%i == "mqtt31.js" java -jar c:\windows\compiler.jar --js js/%%i --js_output_file js/min/%%i 
echo %%i
)

time>js/min/zipcompleted


REM ============================================================END
pause
@ECHO ON

