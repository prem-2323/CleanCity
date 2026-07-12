@echo off
title CleanCity
cd /d "%~dp0"

start "Server" cmd /k "cd /d "%~dp0" && npx tsx server/index.ts"
start "Expo" cmd /k "cd /d "%~dp0" && npx expo start --port 8081"
