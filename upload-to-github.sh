#!/bin/bash

# This script creates a new GitHub repository with the fabric-explorer-quickstart directory

# Create a new directory for the project
echo "Creating a directory for your GitHub repository..."
mkdir -p /home/tuf/explorer-repo

# Copy the files
echo "Copying your Explorer files..."
cp -r /home/tuf/go/src/github.com/Varu19Git/fabric-samples/fabric-explorer-quickstart/* /home/tuf/explorer-repo/
cp /home/tuf/go/src/github.com/Varu19Git/fabric-samples/fabric-explorer-quickstart/.gitignore /home/tuf/explorer-repo/

# Change to the new directory
cd /home/tuf/explorer-repo

# Initialize git repository
echo "Initializing Git repository..."
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit of Fabric Explorer Quickstart"

echo "=============================================="
echo "Your repository is ready at: /home/tuf/explorer-repo"
echo ""
echo "To push this to GitHub:"
echo "1. Create a new repository at: https://github.com/new"
echo "2. Run these commands (replace YOUR_USERNAME with your GitHub username):"
echo ""
echo "   cd /home/tuf/explorer-repo"
echo "   git remote add origin https://github.com/YOUR_USERNAME/fabric-explorer-quickstart.git"
echo "   git push -u origin master"
echo "==============================================" 