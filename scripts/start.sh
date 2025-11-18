#!/bin/bash

# Medical App Backend Startup Script
# This script starts the Medical App backend with proper environment setup

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
NODE_ENV=${NODE_ENV:-development}
PORT=${PORT:-8000}
SEED_DB=${SEED_DATABASE:-true}

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
is_port_in_use() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for a service to be ready
wait_for_service() {
    local url=$1
    local max_attempts=${2:-30}
    local attempt=1

    print_status "Waiting for service at $url to be ready..."

    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" >/dev/null 2>&1; then
            print_success "Service is ready!"
            return 0
        fi

        print_status "Attempt $attempt/$max_attempts: Service not ready yet..."
        sleep 2
        ((attempt++))
    done

    print_error "Service failed to become ready after $max_attempts attempts"
    return 1
}

# Check prerequisites
print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js 18+ to continue."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_NODE_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18+."
    exit 1
fi

print_success "Node.js version $NODE_VERSION found"

# Check if npm is installed
if ! command_exists npm; then
    print_error "npm is not installed."
    exit 1
fi

print_success "npm $(npm --version) found"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the Medical App root directory."
    exit 1
fi

print_success "Medical App package.json found"

# Check if node_modules exists and dependencies are installed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_status "Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before running the server again."
        print_status "Created .env file from .env.example"
        exit 1
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
fi

print_success ".env file found"

# Load environment variables
export NODE_ENV=$NODE_ENV
export PORT=$PORT
export SEED_DATABASE=$SEED_DB

# Check if port is already in use
if is_port_in_use $PORT; then
    print_error "Port $PORT is already in use. Please stop the other service or use a different port."
    print_status "To use a different port, run: PORT=3001 $0"
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

print_status "Starting Medical App Backend..."
print_status "Environment: $NODE_ENV"
print_status "Port: $PORT"
print_status "Database seeding: $SEED_DB"

# Start the server
print_status "Starting Node.js server..."

if [ "$NODE_ENV" = "production" ]; then
    # Production mode with process manager
    if command_exists pm2; then
        print_status "Using PM2 for production deployment..."
        pm2 start src/server/index.ts --name "medical-app" --interpreter ts-node --env production --log logs/app.log --error logs/error.log --out logs/out.log
        print_success "Server started with PM2"
        print_status "To view logs: pm2 logs medical-app"
        print_status "To stop server: pm2 stop medical-app"
        print_status "To restart server: pm2 restart medical-app"

        # Wait for server to be ready
        sleep 5
        wait_for_service "http://localhost:$PORT/health"

    else
        print_warning "PM2 not found, starting with Node.js directly..."
        NODE_ENV=production node dist/server/index.js 2>&1 | tee logs/app.log &
        SERVER_PID=$!

        # Wait for server to be ready
        sleep 5
        if wait_for_service "http://localhost:$PORT/health"; then
            print_success "Server started successfully (PID: $SERVER_PID)"
            print_status "To stop server: kill $SERVER_PID"
        else
            print_error "Server failed to start properly"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
    fi
else
    # Development mode with nodemon
    if command_exists nodemon; then
        print_status "Using nodemon for development..."
        nodemon src/server/index.ts 2>&1 | tee logs/app.log &
        SERVER_PID=$!

        # Wait for server to be ready
        sleep 8
        if wait_for_service "http://localhost:$PORT/health"; then
            print_success "Development server started successfully (PID: $SERVER_PID)"
            print_status "To stop server: kill $SERVER_PID"
            print_status "Logs are being written to logs/app.log"
        else
            print_error "Development server failed to start properly"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
    else
        print_status "Starting development server with ts-node..."
        npx ts-node src/server/index.ts 2>&1 | tee logs/app.log &
        SERVER_PID=$!

        # Wait for server to be ready
        sleep 8
        if wait_for_service "http://localhost:$PORT/health"; then
            print_success "Development server started successfully (PID: $SERVER_PID)"
            print_status "To stop server: kill $SERVER_PID"
        else
            print_error "Development server failed to start properly"
            kill $SERVER_PID 2>/dev/null || true
            exit 1
        fi
    fi
fi

# Test the API endpoints
print_status "Testing API endpoints..."

# Test health endpoint
HEALTH_RESPONSE=$(curl -s http://localhost:$PORT/health)
if [ $? -eq 0 ]; then
    print_success "Health endpoint responding"
else
    print_warning "Health endpoint not responding"
fi

# Test API overview endpoint
API_RESPONSE=$(curl -s http://localhost:$PORT/api)
if [ $? -eq 0 ]; then
    print_success "API overview endpoint responding"
else
    print_warning "API overview endpoint not responding"
fi

print_success ""
print_success "🎉 Medical App Backend is running!"
print_success ""
print_success "📊 Health Check: http://localhost:$PORT/health"
print_success "🔗 API Overview: http://localhost:$PORT/api"
print_success "📖 API Documentation: http://localhost:$PORT/docs (when implemented)"
print_success ""
print_status "Server logs are available in logs/app.log"
print_status "Press Ctrl+C to stop the server"

# Trap Ctrl+C to kill the background process
trap 'print_status "Stopping server..."; kill $SERVER_PID 2>/dev/null || true; print_success "Server stopped"; exit 0' INT

# Wait for the background process
wait $SERVER_PID