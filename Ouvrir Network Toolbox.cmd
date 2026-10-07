@echo off
cd /d "%~dp0"
node "%~dp0scripts\launch-desktop.mjs"
if errorlevel 1 pause
