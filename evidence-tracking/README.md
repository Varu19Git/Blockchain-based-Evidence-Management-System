# Evidence Tracking System

A blockchain-based evidence tracking system built with Hyperledger Fabric, Node.js, and React.js.

## System Architecture

- **Blockchain**: Hyperledger Fabric
- **Backend**: Node.js + Express.js
- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Storage**: PostgreSQL + IPFS
- **Monitoring**: Hyperledger Explorer
- **Security**: OAuth 2.0 + JWT

## Prerequisites

- Docker and Docker Compose
- Node.js v14 or higher
- Go 1.16 or higher
- Hyperledger Fabric binaries and Docker images
- IPFS
- PostgreSQL

## Directory Structure

```
evidence-tracking/
├── chaincode/           # Hyperledger Fabric chaincode (smart contracts)
├── web-app/            
│   ├── frontend/       # React.js frontend application
│   └── backend/        # Node.js backend server
├── network/            # Hyperledger Fabric network configuration
└── config/             # Configuration files
```

## Setup Instructions

1. Install Prerequisites:
   ```bash
   # Install Fabric binaries and Docker images
   curl -sSL https://bit.ly/2ysbOFE | bash -s
   ```

2. Start the Network:
   ```bash
   cd network
   ./startNetwork.sh
   ```

3. Deploy Chaincode:
   ```bash
   ./deployChaincode.sh
   ```

4. Start the Backend:
   ```bash
   cd web-app/backend
   npm install
   npm start
   ```

5. Start the Frontend:
   ```bash
   cd web-app/frontend
   npm install
   npm start
   ```

## Features

1. Evidence Submission
   - Secure file upload with IPFS storage
   - Blockchain-based hash verification
   - Metadata storage in PostgreSQL

2. Audit Trail
   - Immutable transaction history
   - Real-time tracking
   - Comprehensive logging

3. Access Control
   - Role-based permissions
   - Secure authentication
   - Multi-factor authentication support

4. Dashboard
   - Real-time updates
   - Evidence timeline
   - Analytics and reporting

## Development

- Follow the coding standards in `.eslintrc` and `.prettierrc`
- Write unit tests for all new features
- Update documentation as needed

## License

This project is licensed under the Apache License 2.0 