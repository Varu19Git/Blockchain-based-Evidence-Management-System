# Hyperledger Fabric Explorer Quickstart

A streamlined setup for running Hyperledger Fabric with Hyperledger Explorer for blockchain visualization and monitoring.

## Overview

This project provides a simplified way to set up and run a Hyperledger Fabric network along with Hyperledger Explorer, which is a web-based blockchain visualization tool. It includes scripts for installation, starting, stopping, and cleaning up the environment.

## Prerequisites

- Docker and Docker Compose
- Git
- Bash shell
- Curl

## Directory Structure

```
fabric-explorer-quickstart/
├── config/                       # Explorer configuration files
│   ├── config.json               # Main Explorer config
│   └── connection-profile/       # Network connection profiles
│       └── test-network.json     # Connection profile for test network
├── docker-compose.yaml           # Docker services configuration
├── scripts/                      # Management scripts
│   ├── install.sh                # For installation
│   ├── start.sh                  # For starting the network
│   ├── stop.sh                   # For stopping the network
│   └── cleanup.sh                # For cleaning up resources
└── README.md                     # This documentation
```

## Quick Start

1. **Install the environment**:
   ```bash
   ./scripts/install.sh
   ```
   This will download Fabric binaries, pull Docker images, and set up the crypto materials.

2. **Start the network and Explorer**:
   ```bash
   ./scripts/start.sh
   ```
   This will start the Fabric network (orderer and peers), create a channel if needed, and start the Explorer services.

3. **Access Hyperledger Explorer**:
   - Open your browser and go to: http://localhost:8081
   - Login with the following credentials:
     - Username: exploreradmin
     - Password: exploreradminpw

4. **Stop the services**:
   ```bash
   ./scripts/stop.sh
   ```
   This will stop all the services but preserve the data.

5. **Cleanup the environment**:
   ```bash
   ./scripts/cleanup.sh
   ```
   This will remove all containers, volumes, and optionally the crypto materials.

## Network Configuration

The Fabric network consists of:
- 1 Orderer (`orderer.example.com`)
- 2 Peers (`peer0.org1.example.com` and `peer0.org2.example.com`)
- 1 Channel (`mychannel`)

## Development and Customization

To customize this setup for your own projects:

1. Modify the `config/connection-profile/test-network.json` file to change network connection details
2. Update the `docker-compose.yaml` file to modify services, ports, or volumes
3. Adjust the `scripts/start.sh` script to change startup behavior or channel configuration

## Troubleshooting

If you encounter issues:

1. Check the Docker container logs:
   ```bash
   docker logs explorer.example.com
   ```

2. Ensure all services are running:
   ```bash
   docker ps | grep -E 'peer0|orderer|explorer'
   ```

3. If Explorer cannot connect to the network, check the connection profile in `config/connection-profile/test-network.json`

## License

Apache License 2.0

## Acknowledgments

- [Hyperledger Fabric](https://github.com/hyperledger/fabric)
- [Hyperledger Explorer](https://github.com/hyperledger/blockchain-explorer)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

If you find any issues or have suggestions for improvements, please open an issue on GitHub. 