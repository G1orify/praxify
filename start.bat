@echo off
echo ==========================================
echo     [ CIPHER ] INITIALIZING SYSTEM        
echo ==========================================

echo ^> Starting Web Dashboard on Port 3000...
cd website
start cmd /c "npm start"
cd ..

echo ^> Starting Discord Bot...
call venv_win\Scripts\activate.bat
set PYTHONIOENCODING=utf-8
python main.py
pause
