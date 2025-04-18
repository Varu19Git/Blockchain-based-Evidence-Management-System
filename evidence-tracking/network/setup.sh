#!/bin/bash

# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

# Set the config path
export FABRIC_CFG_PATH=${PWD}

# Function to check if required files exist
checkPrerequisites() {
    echo "Checking prerequisites..."
    if [ ! -f "./organizations/cryptogen/crypto-config-org1.yaml" ] || [ ! -f "./organizations/cryptogen/crypto-config-orderer.yaml" ]; then
        echo "Error: Crypto config files not found"
        exit 1
    fi
}

# Function to wait for orderer to be ready
waitForOrderer() {
    echo "Waiting for orderer to be ready..."
    local max_retry=30
    local counter=1
    while [ $counter -le $max_retry ]; do
        if docker exec orderer.example.com ps aux | grep orderer > /dev/null 2>&1; then
            echo "Orderer process is running!"
            sleep 5  # Give the orderer a moment to fully initialize
            return 0
        fi
        echo "Attempt $counter/$max_retry: Orderer not ready yet. Waiting..."
        sleep 2
        counter=$((counter + 1))
    done
    echo "Error: Orderer did not become ready in time"
    exit 1
}

# Function to verify TLS certificates
verifyTLSCerts() {
    echo "Verifying TLS certificates..."
    local ORDERER_CA="/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt"
    if ! docker exec cli test -f "$ORDERER_CA"; then
        echo "Error: TLS certificates not found in expected location"
        exit 1
    fi
}

# Clean up any existing containers and artifacts
echo "Cleaning up existing containers..."
docker-compose down -v
rm -rf crypto-config
rm -rf channel-artifacts

# Check prerequisites
checkPrerequisites

# Create necessary directories
mkdir -p channel-artifacts

# Generate crypto material
echo "Generating crypto material..."
cryptogen generate --config=./crypto-config.yaml

echo "Generating channel configuration block..."
configtxgen -profile TwoOrgsOrdererGenesis -channelID system-channel -outputBlock ./channel-artifacts/genesis.block

echo "Generating channel transaction..."
configtxgen -profile TwoOrgsChannel -outputCreateChannelTx ./channel-artifacts/channel.tx -channelID evidence-tracking

echo "Generating anchor peer update for Org1..."
configtxgen -profile TwoOrgsChannel -outputAnchorPeersUpdate ./channel-artifacts/Org1MSPanchors.tx -channelID evidence-tracking -asOrg Org1MSP

# Start the network
echo "Starting the network..."
docker-compose up -d

# Wait for orderer and peer to start
echo "Waiting for network to start..."
sleep 30

# Verify TLS certificates
verifyTLSCerts

# TLS parameters for CLI commands
ORDERER_CA=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/ordererOrganizations/example.com/orderers/orderer.example.com/tls/ca.crt
PEER_TLS_ROOTCERT_FILE=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt

echo "Creating channel..."
docker exec cli peer channel create -o orderer.example.com:7050 -c evidence-tracking -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/channel.tx --outputBlock /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/evidence-tracking.block --tls --cafile $ORDERER_CA

echo "Joining peer to the channel..."
docker exec cli peer channel join -b /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/evidence-tracking.block

echo "Updating anchor peers..."
docker exec cli peer channel update -o orderer.example.com:7050 -c evidence-tracking -f /opt/gopath/src/github.com/hyperledger/fabric/peer/channel-artifacts/Org1MSPanchors.tx --tls --cafile $ORDERER_CA

echo "Setup completed successfully!" 