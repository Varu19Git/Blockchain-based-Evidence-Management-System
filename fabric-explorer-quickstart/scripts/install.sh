#!/bin/bash

# fabric-explorer-quickstart installation script
# This script will set up the necessary components for running Hyperledger Fabric and Explorer

set -e

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOTDIR="$( cd "${SCRIPTDIR}/.." && pwd )"

echo "===> Installing fabric-explorer-quickstart..."
echo "     Root directory: ${ROOTDIR}"

# Function to check if a command exists
command_exists() {
    command -v $1 >/dev/null 2>&1
}

# Check prerequisites
echo "===> Checking prerequisites..."

# Check if Docker is installed
if ! command_exists docker; then
    echo "Error: Docker is not installed. Please install Docker before continuing."
    exit 1
fi

# Check if Docker Compose is installed
if ! command_exists docker-compose; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose before continuing."
    exit 1
fi

# Check if Fabric binaries are installed
if [ ! -d "${ROOTDIR}/../bin" ]; then
    echo "===> Downloading Hyperledger Fabric binaries..."
    
    mkdir -p "${ROOTDIR}/../bin"
    curl -sSL https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/bootstrap.sh | bash -s -- 2.5.1 -s
else
    echo "===> Hyperledger Fabric binaries already installed"
fi

# Pull required Docker images
echo "===> Pulling required Docker images..."
docker pull hyperledger/fabric-peer:latest
docker pull hyperledger/fabric-orderer:latest
docker pull hyperledger/fabric-tools:latest
docker pull hyperledger/explorer:latest
docker pull hyperledger/explorer-db:latest

# Generate crypto materials for the network
echo "===> Generating crypto materials..."
cd "${ROOTDIR}"
if [ ! -d "../test-network/organizations" ]; then
    echo "===> Setting up test network crypto materials..."
    mkdir -p ../test-network
    # Clone fabric-samples if needed
    if [ ! -d "../fabric-samples" ]; then
        echo "===> Cloning fabric-samples repository..."
        git clone https://github.com/hyperledger/fabric-samples.git ../fabric-samples
    fi
    
    # Use fabric-samples test-network to generate crypto materials
    cp -r ../fabric-samples/test-network ../test-network
    cd ../test-network
    ./network.sh up createChannel -c mychannel
    cd "${ROOTDIR}"
else
    echo "===> Test network crypto materials already exist"
fi

# Update the Explorer connection profile with actual keystore filename
echo "===> Updating Explorer connection profile..."
KEYSTORE_FILE=$(ls -1 ../test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore/ | head -n 1)
if [ -z "$KEYSTORE_FILE" ]; then
    echo "Error: Could not find keystore file"
    exit 1
fi

sed -i "s/KEYSTORE_FILENAME/$KEYSTORE_FILE/g" "${ROOTDIR}/config/connection-profile/test-network.json"

echo "===> Installation complete!"
echo "===> To start the network and Explorer, run: ./scripts/start.sh" 