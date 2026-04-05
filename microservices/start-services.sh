#!/bin/bash

# ThaiBank Microservices Startup Script

set -e

PROJECT_DIR="/home/labadmin/project-moblie-finance/microservices"
cd "$PROJECT_DIR"

echo "🏦 ThaiBank Microservices"
echo "========================"
echo ""

# Function to start a service
start_service() {
  local service_name=$1
  local port=$2

  echo "🚀 Starting $service_name on port $port..."
  cd "$PROJECT_DIR/$service_name"

  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    npm install
  fi

  # Start service in background
  npm start > "/tmp/thaibank-$service_name.log" 2>&1 &
  echo "✓ $service_name started (PID: $!)"
}

# Function to wait for service health
wait_for_service() {
  local service_name=$1
  local port=$2
  local max_attempts=30
  local attempt=1

  echo "⏳ Waiting for $service_name to be ready..."
  while [ $attempt -le $max_attempts ]; do
    if curl -f "http://localhost:$port/health" > /dev/null 2>&1; then
      echo "✓ $service_name is ready"
      return 0
    fi
    sleep 2
    attempt=$((attempt + 1))
  done

  echo "❌ $service_name failed to start"
  return 1
}

# Start services in order
start_service "auth-service" 3001
start_service "user-service" 3002
start_service "account-service" 3003
start_service "transaction-service" 3004

# Wait for core services
wait_for_service "auth-service" 3001
wait_for_service "user-service" 3002
wait_for_service "account-service" 3003
wait_for_service "transaction-service" 3004

# Start API Gateway
start_service "api-gateway" 3000
wait_for_service "api-gateway" 3000

# Start Frontend
start_service "frontend" 8080

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "📱 Access the application:"
echo "   Frontend:    http://localhost:8080"
echo "   API Gateway: http://localhost:3000"
echo ""
echo "🔧 Service URLs:"
echo "   Auth:        http://localhost:3001"
echo "   User:        http://localhost:3002"
echo "   Account:     http://localhost:3003"
echo "   Transaction: http://localhost:3004"
echo "   API Gateway: http://localhost:3000"
echo ""
echo "🛑 To stop all services:"
echo "   pkill -f 'node.*server.js'"
echo ""
echo "📊 Check service health:"
echo "   curl http://localhost:3000/health"
echo ""

# Keep script running
echo "Press Ctrl+C to stop all services"
trap 'echo ""; echo "🛑 Stopping all services..."; pkill -f "node.*server.js"; exit 0' INT
wait