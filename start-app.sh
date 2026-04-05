#!/bin/bash

# ThaiBank App Launcher
# This script starts the development server and opens the app in a browser

set -e

PROJECT_DIR="/home/labadmin/project-moblie-finance"
PORT=8080

echo "🏦 ThaiBank App Launcher"
echo "========================"
echo ""

# Check if already running
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "✓ Server already running on port $PORT"
    sleep 1
else
    echo "🚀 Starting development server on port $PORT..."
    cd "$PROJECT_DIR"
    
    # Start Python server in background
    python3 -m http.server $PORT --directory . > /tmp/thaibank-server.log 2>&1 &
    SERVER_PID=$!
    echo "✓ Server started (PID: $SERVER_PID)"
    
    # Wait for server to be ready
    echo "⏳ Waiting for server to be ready..."
    sleep 2
fi

echo ""
echo "📱 Access the app at:"
echo "   Install Guide: http://localhost:$PORT/public/install.html"
echo "   Direct App:    http://localhost:$PORT/public/login.html"
echo "   Welcome:       http://localhost:$PORT/public/welcome.html"
echo ""
echo "🔐 Test Passwords:"
echo "   • password123"
echo "   • 123456"
echo "   • 1234"
echo ""
echo "💡 Tips:"
echo "   - On Android: Use Chrome or Edge"
echo "   - On iOS: Use Safari only"
echo "   - Desktop: Chrome, Edge, or Brave"
echo "   - To stop server: pkill -f 'http.server'"
echo ""

# Try to open browser
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open "http://localhost:$PORT/public/install.html" &
elif command -v open &> /dev/null; then
    # macOS
    open "http://localhost:$PORT/public/install.html" &
else
    echo "ℹ️  Manual Launch:"
    echo "   Open http://localhost:$PORT/public/install.html in your browser"
fi

echo ""
echo "✓ Ready! Press Ctrl+C to stop"
echo ""

# Keep script running
wait
