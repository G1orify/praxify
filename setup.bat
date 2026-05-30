@echo off
echo Setting up Vibe Recorder on Windows...

:: Create virtual environment
python -m venv venv_win

:: Activate and install dependencies
call venv_win\Scripts\activate.bat
pip install -r requirements.txt

:: Install website dependencies
cd website
npm install
cd ..

echo Setup complete. Run start.bat to launch.
