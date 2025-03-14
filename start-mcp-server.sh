#!/bin/bash

# Start the Supabase MCP server
echo "Starting Supabase MCP server..."
echo "Using configuration from ~/.config/supabase-mcp/.env"
echo "Project: hkbvjdgowdksdkluyirh"

# Export environment variables for the current session
export SUPABASE_PROJECT_REF=hkbvjdgowdksdkluyirh
export SUPABASE_DB_PASSWORD=postgres
export SUPABASE_REGION=us-east-1
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrYnZqZGdvd2Rrc2RrbHV5aXJoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTg0MzQ3NywiZXhwIjoyMDU3NDE5NDc3fQ.L8AXu-dlI9RpVrWczPlTw0fOnJZZvw6SgsByKkdwIGM

# Start the MCP server
supabase-mcp-server
