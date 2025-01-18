#!/bin/sh

echo "Starting production service..."
echo "Service type: $SERVICE_TYPE"

if [ "$SERVICE_TYPE" = "client" ]; then
    echo "Starting client service..."
    cd client
    
    # Build and serve the client
    echo "Building client..."
    pnpm run build
    
    echo "Starting preview server..."
    exec pnpm exec vite preview --host 0.0.0.0 --port 10000 --strictPort true
else
    echo "Starting agent service..."
    cd agent
    exec pnpm start --character=characters/claude_agent.character.json
fi