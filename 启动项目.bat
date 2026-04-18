@echo off
REM 启动蘑菇网项目

echo 正在启动蘑菇网项目...

REM 进入后端目录
cd "%~dp0backend-node"

REM 检查是否安装了依赖
if not exist "node_modules" (
    echo 依赖未安装，正在安装...
    npm install
    if errorlevel 1 (
        echo 依赖安装失败，请检查网络连接
        pause
        exit /b 1
    )
)

REM 启动后端服务
echo 启动后端服务...
npm start

pause