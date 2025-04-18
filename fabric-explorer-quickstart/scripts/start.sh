#!/bin/bash

# Start script for fabric-explorer-quickstart
# This script will start both the Fabric network and Hyperledger Explorer

set -e

SCRIPTDIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOTDIR="$( cd "${SCRIPTDIR}/.." && pwd )"

echo "===> Starting Fabric network and Explorer..."

# Check if the test network is running
if ! docker ps | grep -q "peer0.org1.example.com"; then
    echo "===> Starting Fabric network..."
    cd "${ROOTDIR}"
    docker-compose up -d orderer.example.com peer0.org1.example.com peer0.org2.example.com
    
    # Wait for peers to start
    echo "===> Waiting for Fabric network to start..."
    sleep 10
    
    # Create channel if it doesn't exist
    if [ ! -f "../test-network/channel-artifacts/mychannel.block" ]; then
        echo "===> Creating channel..."
        cd "../test-network"
        export PATH=$PATH:$ROOTDIR/../bin
        
        # Create the configtx directory if it doesn't exist
        mkdir -p configtx
        
        # Create a simple channel configuration if it doesn't exist
        if [ ! -f "configtx/channel.tx" ]; then
            echo "===> Creating channel configuration file..."
            # Simple configtx.yaml for a single channel
            cat > configtx/configtx.yaml <<EOF
---
Organizations:
  - &OrdererOrg
    Name: OrdererOrg
    ID: OrdererMSP
    MSPDir: ../test-network/organizations/ordererOrganizations/example.com/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('OrdererMSP.member')"
      Writers:
        Type: Signature
        Rule: "OR('OrdererMSP.member')"
      Admins:
        Type: Signature
        Rule: "OR('OrdererMSP.admin')"
  - &Org1
    Name: Org1MSP
    ID: Org1MSP
    MSPDir: ../test-network/organizations/peerOrganizations/org1.example.com/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('Org1MSP.admin', 'Org1MSP.peer', 'Org1MSP.client')"
      Writers:
        Type: Signature
        Rule: "OR('Org1MSP.admin', 'Org1MSP.client')"
      Admins:
        Type: Signature
        Rule: "OR('Org1MSP.admin')"
      Endorsement:
        Type: Signature
        Rule: "OR('Org1MSP.peer')"
  - &Org2
    Name: Org2MSP
    ID: Org2MSP
    MSPDir: ../test-network/organizations/peerOrganizations/org2.example.com/msp
    Policies:
      Readers:
        Type: Signature
        Rule: "OR('Org2MSP.admin', 'Org2MSP.peer', 'Org2MSP.client')"
      Writers:
        Type: Signature
        Rule: "OR('Org2MSP.admin', 'Org2MSP.client')"
      Admins:
        Type: Signature
        Rule: "OR('Org2MSP.admin')"
      Endorsement:
        Type: Signature
        Rule: "OR('Org2MSP.peer')"
Capabilities:
  Channel: &ChannelCapabilities
    V2_0: true
  Orderer: &OrdererCapabilities
    V2_0: true
  Application: &ApplicationCapabilities
    V2_0: true
Application: &ApplicationDefaults
  Organizations:
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
    LifecycleEndorsement:
      Type: ImplicitMeta
      Rule: "MAJORITY Endorsement"
    Endorsement:
      Type: ImplicitMeta
      Rule: "MAJORITY Endorsement"
  Capabilities:
    <<: *ApplicationCapabilities
Orderer: &OrdererDefaults
  OrdererType: etcdraft
  Addresses:
    - orderer.example.com:7050
  BatchTimeout: 2s
  BatchSize:
    MaxMessageCount: 10
    AbsoluteMaxBytes: 99 MB
    PreferredMaxBytes: 512 KB
  Organizations:
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
    BlockValidation:
      Type: ImplicitMeta
      Rule: "ANY Writers"
Channel: &ChannelDefaults
  Policies:
    Readers:
      Type: ImplicitMeta
      Rule: "ANY Readers"
    Writers:
      Type: ImplicitMeta
      Rule: "ANY Writers"
    Admins:
      Type: ImplicitMeta
      Rule: "MAJORITY Admins"
  Capabilities:
    <<: *ChannelCapabilities
Profiles:
  ChannelUsingRaft:
    <<: *ChannelDefaults
    Orderer:
      <<: *OrdererDefaults
      Organizations:
        - *OrdererOrg
      Capabilities:
        <<: *OrdererCapabilities
    Application:
      <<: *ApplicationDefaults
      Organizations:
        - *Org1
        - *Org2
      Capabilities:
        <<: *ApplicationCapabilities
    Consortiums:
      SampleConsortium:
        Organizations:
          - *Org1
          - *Org2
EOF
            
            # Generate channel configuration transaction
            configtxgen -profile ChannelUsingRaft -outputCreateChannelTx configtx/channel.tx -channelID mychannel
        fi
        
        export FABRIC_CFG_PATH=$ROOTDIR/../test-network/configtx
        export CORE_PEER_TLS_ENABLED=true
        export CORE_PEER_LOCALMSPID="Org1MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${ROOTDIR}/../test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${ROOTDIR}/../test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
        export CORE_PEER_ADDRESS=localhost:7051
        
        mkdir -p channel-artifacts
        peer channel create -o localhost:7050 -c mychannel --ordererTLSHostnameOverride orderer.example.com -f ./configtx/channel.tx --outputBlock ./channel-artifacts/mychannel.block --tls --cafile ${ROOTDIR}/../test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
        
        # Join org1 peer to the channel
        peer channel join -b ./channel-artifacts/mychannel.block
        
        # Join org2 peer to the channel
        export CORE_PEER_LOCALMSPID="Org2MSP"
        export CORE_PEER_TLS_ROOTCERT_FILE=${ROOTDIR}/../test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
        export CORE_PEER_MSPCONFIGPATH=${ROOTDIR}/../test-network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
        export CORE_PEER_ADDRESS=localhost:9051
        
        peer channel join -b ./channel-artifacts/mychannel.block
        
        cd "${ROOTDIR}"
    fi
else
    echo "===> Fabric network already running"
fi

# Start Explorer
echo "===> Starting Hyperledger Explorer..."
cd "${ROOTDIR}"
docker-compose up -d explorerdb.example.com explorer.example.com

echo "===> Services started successfully!"
echo "===> Hyperledger Explorer is available at http://localhost:8081"
echo "===> Login with username: exploreradmin, password: exploreradminpw" 