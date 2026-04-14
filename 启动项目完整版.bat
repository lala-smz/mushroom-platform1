@echo off
REM 启动蘑菇网项目（完整版）
echo 正在启动蘑菇网项目...

REM 启动后端服务
echo 启动后端服务...
start "后端服务" cmd /k "cd "%~dp0backend-node" && if not exist "node_modules" (echo 依赖未安装，正在安装... && npm install) && npm start"

REM 等待后端服务启动
ping 127.0.0.1 -n 5 > nul

REM 启动前端开发服务器
echo 启动前端服务...
start "前端服务" cmd /k "cd "%~dp0frontend-vue3" && npm run dev"

echo 项目启动完成！请在浏览器中访问 http://localhost:5173
pause