#!/bin/bash

# Ensure all child processes are killed when the script exits (e.g. via Ctrl+C)
trap 'kill 0' SIGINT SIGTERM EXIT

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=========================================="
echo "    [ CIPHER ] INITIALIZING SYSTEM        "
echo "=========================================="

# 1. Start the Express Web Dashboard in the background
echo "> Starting Web Dashboard on Port 3000..."
cd "$SCRIPT_DIR/website"
npm start &

# 2. Start the Discord Bot in the foreground
echo "> Starting Discord Bot..."
cd "$SCRIPT_DIR"
source venv/bin/activate
python main.py
