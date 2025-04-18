#!/bin/bash

# Stop script for fabric-explorer-quickstart
# This script will stop both the Fabric network and Hyperledger Explorer

set -e

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOTDIR="$( cd "${SCRIPTDIR}/.." && pwd )"

echo "===> Stopping Fabric network and Explorer..."

# Stop Explorer first
echo "===> Stopping Hyperledger Explorer..."
cd "${ROOTDIR}"
docker-compose stop explorer.example.com explorerdb.example.com

# Stop Fabric network
echo "===> Stopping Fabric network..."
docker-compose stop orderer.example.com peer0.org1.example.com peer0.org2.example.com

echo "===> Services stopped successfully!" 