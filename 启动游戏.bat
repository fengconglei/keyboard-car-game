@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo 没有找到 Node.js，先直接双击 index.html 也可以玩。
  pause
  exit /b 1
)

echo 正在启动《键盘小车手》...
echo.
echo 如果浏览器没有自动打开，请手动访问：
echo http://127.0.0.1:8000/
echo.

start "" cmd /c "timeout /t 1 /nobreak >nul && start http://127.0.0.1:8000/"
node preview-server.js

pause
