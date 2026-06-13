@echo off
cd /d "%~dp0"

where git >nul 2>nul
if errorlevel 1 (
  echo 没有找到 Git，请先安装 Git。
  pause
  exit /b 1
)

if not exist ".git" (
  echo 正在初始化本地 Git 仓库...
  git init
  git branch -M main
  git remote add origin https://github.com/fengconglei/keyboard-car-game.git
)

git config user.name >nul 2>nul
if errorlevel 1 git config user.name "fengconglei"

git config user.email >nul 2>nul
if errorlevel 1 git config user.email "fengconglei@users.noreply.github.com"

echo.
echo 正在准备发布到 GitHub...
git add index.html styles.css game.js preview-server.js "启动游戏.bat" "发布到GitHub.bat"

set commit_msg=更新键盘小车手
git commit -m "%commit_msg%"
if errorlevel 1 (
  echo.
  echo 没有新的改动需要发布，或者提交失败。
  echo 如果提示需要登录 GitHub，请按提示完成登录后再运行一次。
  pause
  exit /b 1
)

echo.
echo 正在推送到 GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo 推送失败。通常是第一次需要登录 GitHub，或远程仓库已有网页上传的文件。
  echo 如果提示登录，请登录后再运行一次。
  pause
  exit /b 1
)

echo.
echo 发布完成。稍等 1-2 分钟后访问：
echo https://fengconglei.github.io/keyboard-car-game/
pause
