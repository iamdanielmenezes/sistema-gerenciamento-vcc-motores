
@echo off
title VCC Motores - Sistema de Gerenciamento

cd /d "%~dp0"

echo ==========================================
echo        VCC MOTORES
echo        Sistema de Gerenciamento
echo ==========================================
echo.

if not exist "target\Sistema-de-gerenciamento-0.0.1-SNAPSHOT.jar" (
    echo ERRO: Arquivo JAR nao encontrado.
    echo.
    echo Gere a aplicacao pelo Maven antes de iniciar.
    pause
    exit /b 1
)

echo Iniciando o VCC Motores...
echo.
echo Aguarde alguns segundos.
echo O PostgreSQL precisa estar em funcionamento.
echo.

start "" "http://localhost:8080"

java -jar "target\Sistema-de-gerenciamento-0.0.1-SNAPSHOT.jar"

echo.
echo O VCC Motores foi encerrado.
pause
