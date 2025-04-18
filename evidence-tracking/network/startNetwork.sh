#!/bin/bash

# Exit on first error
set -e

# don't rewrite paths for Windows Git Bash users
export MSYS_NO_PATHCONV=1

# Obtain CONTAINER_IDS and remove them
# This function is called when you bring a network down
function clearContainers() {
  CONTAINER_IDS=$(docker ps -a | awk '($2 ~ /dev-peer.*/) {print $1}')
  if [ -z "$CONTAINER_IDS" -o "$CONTAINER_IDS" == " " ]; then
    echo "No containers available for deletion"
  else
    docker rm -f $CONTAINER_IDS
  fi
}

# Delete any images that were generated as a part of this setup
function removeUnwantedImages() {
  DOCKER_IMAGE_IDS=$(docker images | awk '($1 ~ /dev-peer.*/) {print $3}')
  if [ -z "$DOCKER_IMAGE_IDS" -o "$DOCKER_IMAGE_IDS" == " " ]; then
    echo "No images available for deletion"
  else
    docker rmi -f $DOCKER_IMAGE_IDS
  fi
}

# Bring down the network
function networkDown() {
  cd ../../test-network
  ./network.sh down
  clearContainers
  removeUnwantedImages
  cd ../evidence-tracking/network
}

# Start the network
function networkUp() {
  cd ../../test-network
  ./network.sh up createChannel -c evidencechannel -ca
  cd ../evidence-tracking/network
}

# Deploy the chaincode
function deployChaincode() {
  cd ../../test-network
  ./network.sh deployCC -ccn evidence -ccp ../evidence-tracking/chaincode -ccl go -c evidencechannel
  cd ../evidence-tracking/network
}

# Start Explorer
function startExplorer() {
  cd ../../blockchain-explorer
  docker-compose up -d
  cd ../evidence-tracking/network
}

# Handle command line options
case $1 in
  "up")
    networkUp
    deployChaincode
    startExplorer
    ;;
  "down")
    networkDown
    ;;
  *)
    echo "Usage: $0 [up|down]"
    echo "  up - bring up the network and deploy chaincode"
    echo "  down - bring down the network"
    exit 1
esac 