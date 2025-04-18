#!/bin/bash

# This script helps set up a new GitHub repository with just the fabric-explorer-quickstart directory

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up a new GitHub repository for fabric-explorer-quickstart${NC}"

# Create a temporary directory
TEMP_DIR=$(mktemp -d)
echo -e "${GREEN}Created temporary directory: ${TEMP_DIR}${NC}"

# Copy fabric-explorer-quickstart files to the temporary directory
echo -e "${GREEN}Copying fabric-explorer-quickstart files...${NC}"
cp -r fabric-explorer-quickstart/* $TEMP_DIR/
cp fabric-explorer-quickstart/.gitignore $TEMP_DIR/

# Initialize a new Git repository in the temporary directory
cd $TEMP_DIR
echo -e "${GREEN}Initializing new Git repository...${NC}"
git init

# Add and commit the files
echo -e "${GREEN}Adding files to Git...${NC}"
git add .
git commit -m "Initial commit for Fabric Explorer Quickstart"

echo -e "${YELLOW}Please create a new repository on GitHub:${NC}"
echo -e "1. Go to https://github.com/new"
echo -e "2. Name your repository: fabric-explorer-quickstart"
echo -e "3. Choose public or private repository"
echo -e "4. Do NOT initialize with README, .gitignore, or license"
echo -e "5. Click 'Create repository'"

echo -e "${YELLOW}After creating the repository, enter your GitHub username:${NC}"
read USERNAME

echo -e "${YELLOW}Enter your personal access token (or leave blank to use SSH or be prompted later):${NC}"
read -s TOKEN

# Set up the remote repository
if [ -z "$TOKEN" ]; then
    echo -e "${GREEN}Setting up remote with standard URL...${NC}"
    git remote add origin https://github.com/$USERNAME/fabric-explorer-quickstart.git
else
    echo -e "${GREEN}Setting up remote with personal access token...${NC}"
    git remote add origin https://$USERNAME:$TOKEN@github.com/$USERNAME/fabric-explorer-quickstart.git
fi

# Push to GitHub
echo -e "${GREEN}Pushing to GitHub...${NC}"
git push -u origin master

echo -e "${GREEN}Repository setup complete!${NC}"
echo -e "Your repository is now available at: https://github.com/$USERNAME/fabric-explorer-quickstart"
echo -e "${YELLOW}Temporary directory with local repository: ${TEMP_DIR}${NC}"
echo -e "You can continue working from this directory or clone it again." 