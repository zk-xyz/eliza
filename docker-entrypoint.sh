#!/bin/sh

if [ "$SERVICE_TYPE" = "client" ]; then
    echo "Starting client service..."
    exec pnpm start:client
else
    echo "Starting agent service..."
    exec pnpm start --character=characters/claude_agent.character.json
fi