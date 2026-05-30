#!/bin/bash
echo "Setting up Vibe Recorder..."

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

echo "Setup complete. You can now run the bot with: cd $SCRIPT_DIR && source venv/bin/activate && python main.py"
