#!/bin/bash

echo "Setting up PostgreSQL for Bug Bounty MCP Server"
echo ""
echo "You'll need to set a password for the postgres user."
echo "Run this command and enter a password when prompted:"
echo ""
echo "psql -U postgres -c \"ALTER USER postgres PASSWORD 'your_password_here';\""
echo ""
echo "Then update ~/.cursor/mcp.json with:"
echo '  "POSTGRES_PASSWORD": "your_password_here"'
echo ""
echo "After that, run: node init-db.js"










