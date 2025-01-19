#!/bin/sh
set -e

echo "Starting service in production mode..."
echo "Service type: $SERVICE_TYPE"

if [ "$SERVICE_TYPE" = "client" ]; then
    echo "Starting client service..."
    cd client
    pnpm run build
    exec pnpm exec vite preview
elif [ "$SERVICE_TYPE" = "agent" ]; then
    echo "Starting agent service..."
    pnpm start --character=characters/claude_agent.character.json
else
    echo "Error: SERVICE_TYPE must be either 'client' or 'agent'"
    exit 1
fi