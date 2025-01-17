#!/bin/sh

if [ "$SERVICE_TYPE" = "client" ]; then
    echo "Starting client service..."
    # First make sure the client is built
    cd client && pnpm run build
    # Use a static file server to serve the built files
    exec pnpm exec vite preview --host 0.0.0.0 --port $PORT
else
    echo "Starting agent service..."
    exec pnpm start --character=characters/claude_agent.character.json
fi