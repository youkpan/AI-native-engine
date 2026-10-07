@echo off
setlocal
title ZY AI Native 原生引擎 v1.0

set "ROOT=%~dp0"
set "PLATFORM_EXE=%ROOT%platform\platform-server.exe"
set "PROJECT_EXE=%ROOT%project-server\project-server.exe"
set "EDGE_EXE=%ROOT%edge-client\edge-client.exe"
set "EDGE_CFG=%ROOT%edge-client\configs\config.toml"
set "PLATFORM_CFG=%ROOT%platform\configs\config.yaml"
set "PROJECT_CFG=%ROOT%project-server\configs\config.yaml"

echo ================================================
echo    ZY AI Native 原生引擎 v1.0  一键运行
echo    前端页面    http://localhost
echo    大平台 API  http://localhost:18000
echo    项目服务器  http://localhost:8090
echo ================================================
echo.

rem LLM gateway: ds flash v4 (deepseek-v4-flash[1m])
set "QS_AUTH_TOKEN=deepseekkey 填写这里"
set "ANTHROPIC_AUTH_TOKEN=%QS_AUTH_TOKEN%"
set "QS_BASE_URL=https://api.deepseek.com/anthropic"
set "ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic"
set "QS_MODEL=deepseek-v4-flash[1m]"
set "ANTHROPIC_MODEL=deepseek-v4-flash[1m]"

echo.
echo [0] 腾讯云 CVM 配置（如需要请手工修改下方值）
:: --- 腾讯云 API 密钥 ---
set "AE_TENCENT_CLOUD_SECRET_ID=填写这里"
set "AE_TENCENT_CLOUD_SECRET_KEY=填写这里"
:: --- 区域 & 可用区 ---
set "AE_TENCENT_CLOUD_DEFAULT_REGION=ap-guangzhou"
set "AE_TENCENT_CLOUD_DEFAULT_ZONE=ap-guangzhou-3"
set "AE_TENCENT_CLOUD_DEFAULT_IMAGE_ID="
set "AE_TENCENT_CLOUD_DEFAULT_VPC_ID="
set "AE_TENCENT_CLOUD_DEFAULT_SUBNET_ID="
:: 安全组用逗号分隔填写，例如 sg-xxx,sg-yyy
:: set "AE_TENCENT_CLOUD_DEFAULT_SECURITY_GROUP_IDS=sg-xxx"


echo [OK] 可执行文件就绪

rem ---- 检查配置占位符 ----
findstr /C:"CHANGE_ME" "%PLATFORM_CFG%" >nul 2>&1
if not errorlevel 1 (
    echo [!] 警告：%PLATFORM_CFG% 仍包含占位符 CHANGE_ME
    echo        请先修改数据库密码 / JWT 密钥 / LLM API Key
)
findstr /C:"CHANGE_ME" "%PROJECT_CFG%" >nul 2>&1
if not errorlevel 1 (
    echo [!] 警告：%PROJECT_CFG% 仍包含占位符 CHANGE_ME
    echo        请先修改数据库密码 / LLM API Key / hmac_secret
)

echo 请确保 PostgreSQL 安装完成，并启动

rem ---- 启动 大平台（18000 + 前端静态代理 80）----
start "ZY-Platform" /D "%ROOT%platform" cmd /k "platform-server.exe"
echo [1/3] 大平台已启动  API=http://localhost:18000

timeout /t 2 /nobreak >nul

rem ---- 启动 项目服务器 ----
start "ZY-ProjectServer" /D "%ROOT%project-server" cmd /k "project-server.exe"
echo [2/3] 项目服务器已启动  http://localhost:8090

echo [3/3] 前端页面 http://localhost （80 端口由大平台静态代理提供）
ping http://127.0.0.1/
start http://127.0.0.1/

echo.
echo ================================================
echo   全部启动完成！
echo   前端:        http://localhost
echo   大平台 API:  http://localhost:18000
echo   项目服务器:  http://localhost:8090
echo   各服务在独立窗口运行，关闭窗口即停止服务。
echo   如 80 端口被占用/无权限，请修改
echo   platform\configs\config.yaml 的 web_port。
echo ================================================

rem ---- 边缘客户端（可选）----
if exist "%EDGE_EXE%" (
    echo.
    choice /C YN /M "是否启动边缘客户端 edge-client"
    if errorlevel 2 goto :done
    if not exist "%EDGE_CFG%" (
        echo [!] 未找到边缘客户端配置 %EDGE_CFG%
        echo    首次运行请先执行：edge-client -init 生成配置后重试
        goto :done
    )
    start "ZY-EdgeClient" /D "%ROOT%edge-client" cmd /k "edge-client.exe"
    echo 边缘客户端已启动
)

:done
echo.
echo 按任意键关闭本窗口（各服务窗口仍会继续运行）。
pause >nul
exit /b 0

:fail
echo.
echo 启动失败，请根据上方提示处理。
pause
exit /b 1
