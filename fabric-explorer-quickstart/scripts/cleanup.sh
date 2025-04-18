#!/bin/bash

# Cleanup script for fabric-explorer-quickstart
# This script will remove all containers, volumes and cleanup the environment

set -e

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOTDIR="$( cd "${SCRIPTDIR}/.." && pwd )"

echo "===> Cleaning up Fabric network and Explorer..."

# Bring down Docker Compose services
echo "===> Bringing down all services..."
cd "${ROOTDIR}"
docker-compose down -v

# Remove containers that might still be running
echo "===> Removing any remaining containers..."
CONTAINERS=$(docker ps -a | grep -E 'peer0|orderer|explorer' | awk '{print $1}')
if [ -n "$CONTAINERS" ]; then
    docker rm -f $CONTAINERS
fi

# Prune volumes
echo "===> Pruning unused Docker volumes..."
docker volume prune -f

# Cleanup the crypto material (optional)
read -p "Do you want to remove the crypto material as well? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "===> Removing crypto material..."
    rm -rf "${ROOTDIR}/../test-network"
fi

echo "===> Cleanup complete!" 