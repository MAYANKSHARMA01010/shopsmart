#!/bin/bash

# This script updates your GitHub Repository secrets with new AWS Lab credentials.
# Required: GitHub CLI (gh) installed and authenticated.

# Function to extract from .env
get_from_env() {
    grep "^$1=" .env | cut -d'=' -f2 | sed 's/^"//;s/"$//' | sed "s/^'//;s/'$//"
}

# 1. Check if .env has the keys
if [ -f .env ]; then
    echo "📂 Found .env file. Checking for AWS credentials..."
    ACCESS_KEY=$(get_from_env "AWS_ACCESS_KEY_ID")
    SECRET_KEY=$(get_from_env "AWS_SECRET_ACCESS_KEY")
    SESSION_TOKEN=$(get_from_env "AWS_SESSION_TOKEN")
fi

# 2. If not in .env, ask for manual input
if [[ -z "$ACCESS_KEY" || -z "$SECRET_KEY" || -z "$SESSION_TOKEN" ]]; then
    echo "🗝️  Paste your new AWS Lab credentials below (the block starting with 'export AWS_ACCESS_KEY_ID=...')"
    echo "Note: Press Ctrl+D (or Cmd+D on Mac) after pasting to save."
    
    INPUT=$(cat)
    
    # Extract values from pasted input
    ACCESS_KEY=$(echo "$INPUT" | grep -o 'AWS_ACCESS_KEY_ID=[^ ]*' | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    SECRET_KEY=$(echo "$INPUT" | grep -o 'AWS_SECRET_ACCESS_KEY=[^ ]*' | cut -d'=' -f2 | tr -d '"' | tr -d "'")
    SESSION_TOKEN=$(echo "$INPUT" | grep -o 'AWS_SESSION_TOKEN=[^ ]*' | cut -d'=' -f2 | tr -d '"' | tr -d "'")
fi

# Check if we finally got the values
if [[ -z "$ACCESS_KEY" || -z "$SECRET_KEY" || -z "$SESSION_TOKEN" ]]; then
    echo "❌ Error: Could not find AWS keys in .env or your input."
    exit 1
fi

# 0. Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ Error: GitHub CLI (gh) is not installed."
    echo "💡 Install it on Mac with: brew install gh"
    echo "💡 Then log in with: gh auth login"
    exit 1
fi

echo "🚀 Updating GitHub Secrets..."

# Update GitHub Secrets using the gh CLI
gh secret set AWS_ACCESS_KEY_ID --body "$ACCESS_KEY" && \
gh secret set AWS_SECRET_ACCESS_KEY --body "$SECRET_KEY" && \
gh secret set AWS_SESSION_TOKEN --body "$SESSION_TOKEN"

if [ $? -eq 0 ]; then
    echo "✅ Success! Your GitHub Action secrets have been synchronized."
else
    echo "❌ Error: Failed to update secrets. Make sure you are logged in (gh auth login)."
    exit 1
fi
