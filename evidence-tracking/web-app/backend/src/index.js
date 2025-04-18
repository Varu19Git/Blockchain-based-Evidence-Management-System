const express = require('express');
const cors = require('cors');
const { create } = require('ipfs-http-client');
const multer = require('multer');
const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const { buildCAClient, registerAndEnrollUser, enrollAdmin } = require('./utils/CAUtil');
const { buildCCPOrg1, buildWallet } = require('./utils/AppUtil');
const { Server } = require('socket.io');
const http = require('http');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// IPFS client setup
const ipfs = create({ url: process.env.IPFS_URL || 'http://localhost:5001' });

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Fabric network setup
const channelName = 'evidencechannel';
const chaincodeName = 'evidence';
const mspOrg1 = 'Org1MSP';
const walletPath = path.join(__dirname, 'wallet');
const org1UserId = 'appUser';

// Initialize the wallet and create a gateway
async function initGateway() {
  try {
    const ccp = buildCCPOrg1();
    const caClient = buildCAClient(FabricCAServices, ccp, 'ca.org1.example.com');
    const wallet = await buildWallet(Wallets, walletPath);

    // Enroll admin if not already enrolled
    await enrollAdmin(caClient, wallet, mspOrg1);
    
    // Register and enroll application user if not already enrolled
    await registerAndEnrollUser(caClient, wallet, mspOrg1, org1UserId, 'org1.department1');

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: org1UserId,
      discovery: { enabled: true, asLocalhost: true }
    });

    return gateway;
  } catch (error) {
    console.error('Failed to initialize gateway:', error);
    throw error;
  }
}

// API Routes

// Submit evidence
app.post('/api/evidence', upload.single('file'), async (req, res) => {
  try {
    const { caseId, description, metadata } = req.body;
    const file = req.file;

    // Upload file to IPFS
    const result = await ipfs.add(file.buffer);
    const ipfsHash = result.path;

    // Calculate file hash
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // Submit to blockchain
    const gateway = await initGateway();
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const evidenceId = `EV${Date.now()}`;
    await contract.submitTransaction(
      'CreateEvidence',
      evidenceId,
      caseId,
      description,
      fileHash,
      ipfsHash,
      req.user.id, // Assuming user authentication is implemented
      metadata
    );

    // Notify connected clients
    io.emit('evidenceUpdated', { type: 'CREATE', evidenceId });

    res.status(201).json({
      evidenceId,
      ipfsHash,
      fileHash
    });
  } catch (error) {
    console.error('Error submitting evidence:', error);
    res.status(500).json({ error: 'Failed to submit evidence' });
  }
});

// Get all evidence
app.get('/api/evidence', async (req, res) => {
  try {
    const gateway = await initGateway();
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const result = await contract.evaluateTransaction('GetAllEvidence');
    const evidence = JSON.parse(result.toString());

    res.json(evidence);
  } catch (error) {
    console.error('Error getting evidence:', error);
    res.status(500).json({ error: 'Failed to get evidence' });
  }
});

// Get evidence by ID
app.get('/api/evidence/:id', async (req, res) => {
  try {
    const gateway = await initGateway();
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const result = await contract.evaluateTransaction('ReadEvidence', req.params.id);
    const evidence = JSON.parse(result.toString());

    res.json(evidence);
  } catch (error) {
    console.error('Error getting evidence:', error);
    res.status(500).json({ error: 'Failed to get evidence' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 