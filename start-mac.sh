# Mac-specific startup script for LOOM platform
# Set environment variables
export PORT=5001
export NODE_ENV=development
export DATABASE_URL="postgresql://gianmaria@localhost:5432/loom_db"
export JWT_SECRET="your-jwt-secret-key-change-in-production"
# Create .env.local with correct port
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5001
VITE_WS_URL=ws://localhost:5001
PORT=5001
EOF
echo "Starting LOOM platform on port 5001..."
echo "Environment variables set:"
echo "  PORT: $PORT"
echo "  NODE_ENV: $NODE_ENV"
echo "  DATABASE_URL: $DATABASE_URL"
echo ""
echo "Access the application at: http://localhost:5001"
echo ""
# Start the application