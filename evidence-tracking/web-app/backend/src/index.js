const express = require('express');
const cors = require('cors');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
const authRoutes = require('./routes/auth');
const { authenticateJWT } = require('./utils/auth');

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

// Multer setup for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Mock evidence data for testing
const mockEvidence = [
  {
    ID: "EV001",
    Description: "Surveillance camera footage from Main St",
    CaseID: "CASE1001",
    FileHash: "QmT78zSuBmuS4z925WZfrqQ1qHaJ56DQaTfyMUF7F8ff5o",
    SubmittedBy: "officer1",
    SubmittedTime: "2025-04-18T10:00:00Z",
    Status: "verified",
    Tags: ["video", "surveillance"],
    Metadata: JSON.stringify({
      format: "mp4", 
      duration: "00:32:15", 
      location: "Main St & 5th Ave"
    }),
  },
  {
    ID: "EV002",
    Description: "Fingerprint from door handle",
    CaseID: "CASE1001",
    FileHash: "QmXs5YtpYsLCYkioRFgRRYQTQ1E4Zpfpbj2GRLo4qJ8L9d",
    SubmittedBy: "officer2",
    SubmittedTime: "2025-04-18T11:30:00Z",
    Status: "processing",
    Tags: ["fingerprint", "physical"],
    Metadata: JSON.stringify({
      type: "latent", 
      surface: "metal", 
      quality: "high"
    }),
  },
  {
    ID: "EV003",
    Description: "DNA sample from crime scene",
    CaseID: "CASE1002",
    FileHash: "QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn",
    SubmittedBy: "officer1",
    SubmittedTime: "2025-04-19T09:15:00Z",
    Status: "submitted",
    Tags: ["dna", "biological"],
    Metadata: JSON.stringify({
      type: "blood", 
      container: "vial",
      location: "bathroom"
    }),
  },
  {
    ID: "EV004",
    Description: "Witness statement - John Doe",
    CaseID: "CASE1002",
    FileHash: "QmQtYfNXWK2sGGcN1fdsgrtH5XYs1FAM9wUWNqjP5ux4FQ",
    SubmittedBy: "officer2",
    SubmittedTime: "2025-04-19T14:30:00Z",
    Status: "verified",
    Tags: ["statement", "document"],
    Metadata: JSON.stringify({
      format: "pdf", 
      witness: "John Doe",
      pages: 3
    }),
  },
  {
    ID: "EV005",
    Description: "Ballistics report - recovered bullet",
    CaseID: "CASE1003",
    FileHash: "QmT1TbZtFqjvbFidLUrD9hPgMZVjRhQP3yWFG7AzBkHEBE",
    SubmittedBy: "officer1",
    SubmittedTime: "2025-04-20T11:00:00Z",
    Status: "processing",
    Tags: ["ballistics", "report"],
    Metadata: JSON.stringify({
      caliber: "9mm", 
      firearm_type: "handgun",
      report_id: "BAL-2025-042"
    }),
  }
];

// Routes
app.use('/api/auth', authRoutes);

// API Routes that require authentication
app.use('/api/evidence', authenticateJWT);

// Submit evidence
app.post('/api/evidence', upload.single('file'), async (req, res) => {
  try {
    const { caseId, description, name, type, location, tags } = req.body;
    const file = req.file;

    // Generate a mock IPFS hash
    const mockIpfsHash = `Qm${crypto.randomBytes(16).toString('hex')}`;
    
    // Calculate file hash if file exists
    const fileHash = file ? 
      crypto.createHash('sha256').update(file.buffer).digest('hex') : 
      `hash_${Date.now()}`;

    // Create a new evidence record
    const evidenceId = `EV${Date.now()}`;
    const newEvidence = {
      ID: evidenceId,
      Description: description,
      CaseID: caseId,
      FileHash: fileHash,
      SubmittedBy: req.user.id, // Use authenticated user ID
      SubmittedTime: new Date().toISOString(),
      Status: "submitted",
      Tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      Metadata: JSON.stringify({
        name,
        type,
        location,
        ipfsHash: mockIpfsHash
      }),
    };

    // Add to mock DB
    mockEvidence.push(newEvidence);

    // Notify connected clients
    io.emit('evidenceUpdated', { 
      type: 'CREATE', 
      evidenceId,
      submittedBy: `${req.user.firstName} ${req.user.lastName}`
    });

    res.status(201).json({
      evidenceId,
      ipfsHash: mockIpfsHash,
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
    // Filter evidence based on user role and permissions
    let filteredEvidence = [...mockEvidence];
    
    // Only administrators and supervisors can see all evidence
    // Officers and detectives see only evidence related to their cases
    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      filteredEvidence = mockEvidence.filter(e => 
        e.SubmittedBy === req.user.id || 
        // In a real app, we would check if the user is assigned to the case
        e.CaseID === 'CASE1001' // Mock case assignment for testing
      );
    }
    
    res.json(filteredEvidence);
  } catch (error) {
    console.error('Error getting evidence:', error);
    res.status(500).json({ error: 'Failed to get evidence' });
  }
});

// Get evidence by ID
app.get('/api/evidence/:id', async (req, res) => {
  try {
    const evidence = mockEvidence.find(e => e.ID === req.params.id);
    
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    
    // Check if user has permission to view this evidence
    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      // Check if the user submitted this evidence or is assigned to the case
      const hasAccess = evidence.SubmittedBy === req.user.id || evidence.CaseID === 'CASE1001';
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'You do not have permission to access this evidence' });
      }
    }
    
    res.json(evidence);
  } catch (error) {
    console.error('Error getting evidence:', error);
    res.status(500).json({ error: 'Failed to get evidence' });
  }
});

// Update evidence status (supervisor only)
app.put('/api/evidence/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Only supervisors can update evidence status
    if (req.user.role !== 'supervisor' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only supervisors can update evidence status' });
    }
    
    // Valid status values
    const validStatus = ['submitted', 'processing', 'verified', 'rejected'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    const evidenceIndex = mockEvidence.findIndex(e => e.ID === id);
    
    if (evidenceIndex === -1) {
      return res.status(404).json({ error: 'Evidence not found' });
    }
    
    // Update status
    mockEvidence[evidenceIndex].Status = status;
    
    // Notify connected clients
    io.emit('evidenceUpdated', { 
      type: 'UPDATE', 
      evidenceId: id,
      status,
      updatedBy: `${req.user.firstName} ${req.user.lastName}`
    });
    
    res.json({ message: 'Evidence status updated', evidence: mockEvidence[evidenceIndex] });
  } catch (error) {
    console.error('Error updating evidence status:', error);
    res.status(500).json({ error: 'Failed to update evidence status' });
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