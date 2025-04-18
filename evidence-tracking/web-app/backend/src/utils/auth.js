const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Secret key for JWT signing - should be in environment variables for production
const JWT_SECRET = process.env.JWT_SECRET || 'evidence-tracking-secret-key';
const TOKEN_EXPIRATION = '24h';

// User roles
const ROLES = {
  OFFICER: 'officer',      // Can submit evidence
  SUPERVISOR: 'supervisor', // Can verify evidence
  DETECTIVE: 'detective',   // Can only view evidence
  ADMIN: 'admin'           // Can manage users and system
};

// In-memory user store (should be replaced with database in production)
const users = [
  {
    id: 'admin1',
    username: 'admin',
    // Password: admin123
    passwordHash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    firstName: 'System',
    lastName: 'Administrator',
    email: 'admin@evidencetrack.org',
    department: 'IT',
    role: ROLES.ADMIN,
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'officer1',
    username: 'jsmith',
    // Password: password123
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    firstName: 'John',
    lastName: 'Smith',
    email: 'jsmith@police.gov',
    department: 'Evidence Collection',
    role: ROLES.OFFICER,
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'supervisor1',
    username: 'mjohnson',
    // Password: password123
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    firstName: 'Maria',
    lastName: 'Johnson',
    email: 'mjohnson@police.gov',
    department: 'Evidence Management',
    role: ROLES.SUPERVISOR,
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'detective1',
    username: 'dcooper',
    // Password: password123
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    firstName: 'David',
    lastName: 'Cooper',
    email: 'dcooper@police.gov',
    department: 'Investigations',
    role: ROLES.DETECTIVE,
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'officer2',
    username: 'agarcia',
    // Password: password123
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    firstName: 'Ana',
    lastName: 'Garcia',
    email: 'agarcia@police.gov',
    department: 'Evidence Collection',
    role: ROLES.OFFICER,
    approved: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'pending1',
    username: 'rwilson',
    // Password: password123
    passwordHash: 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f',
    firstName: 'Robert',
    lastName: 'Wilson',
    email: 'rwilson@police.gov',
    department: 'Digital Forensics',
    role: ROLES.DETECTIVE,
    approved: false,
    createdAt: new Date().toISOString()
  }
];

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {string} - Hashed password
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

/**
 * Validate user credentials
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Object|null} - User object if authenticated, null otherwise
 */
const authenticateUser = (username, password) => {
  const passwordHash = hashPassword(password);
  const user = users.find(u => u.username === username && u.passwordHash === passwordHash);
  
  if (user && !user.approved) {
    throw new Error('Account pending approval');
  }
  
  return user || null;
};

/**
 * Generate a JWT token for a user
 * @param {Object} user - User object
 * @returns {string} - JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Register a new user
 * @param {Object} userData - User data
 * @returns {Object} - Created user
 */
const registerUser = (userData) => {
  // Check if username already exists
  if (users.some(u => u.username === userData.username)) {
    throw new Error('Username already exists');
  }
  
  // Check if email already exists
  if (users.some(u => u.email === userData.email)) {
    throw new Error('Email already exists');
  }
  
  const newUser = {
    id: `user${Date.now()}`,
    username: userData.username,
    passwordHash: hashPassword(userData.password),
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    department: userData.department,
    role: userData.role || ROLES.OFFICER, // Default role
    approved: false, // New users require approval
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Return user without password hash
  const { passwordHash, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Get all users (admin only)
 * @returns {Array} - List of users without password hashes
 */
const getAllUsers = () => {
  return users.map(({ passwordHash, ...user }) => user);
};

/**
 * Get pending approval users
 * @returns {Array} - List of users pending approval
 */
const getPendingUsers = () => {
  return users
    .filter(user => !user.approved)
    .map(({ passwordHash, ...user }) => user);
};

/**
 * Approve a user
 * @param {string} userId - User ID to approve
 * @returns {Object} - Updated user or null if not found
 */
const approveUser = (userId) => {
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return null;
  }
  
  users[userIndex].approved = true;
  
  const { passwordHash, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};

/**
 * Delete a user
 * @param {string} userId - User ID to delete
 * @returns {boolean} - Success status
 */
const deleteUser = (userId) => {
  const initialLength = users.length;
  const newUsers = users.filter(u => u.id !== userId);
  
  if (newUsers.length === initialLength) {
    return false;
  }
  
  // Update the users array
  users.length = 0;
  users.push(...newUsers);
  
  return true;
};

/**
 * Check if a user has required role
 * @param {Object} user - User object
 * @param {Array|string} requiredRoles - Required role(s)
 * @returns {boolean} - Whether user has required role
 */
const hasRole = (user, requiredRoles) => {
  if (!user) return false;
  
  if (Array.isArray(requiredRoles)) {
    return requiredRoles.includes(user.role);
  }
  
  return user.role === requiredRoles;
};

/**
 * Middleware to authenticate requests
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token missing' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: error.message });
  }
};

/**
 * Middleware to authorize by role
 * @param {Array|string} roles - Required role(s)
 * @returns {Function} - Express middleware
 */
const authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!hasRole(req.user, roles)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  ROLES,
  authenticateUser,
  generateToken,
  verifyToken,
  hashPassword,
  registerUser,
  getAllUsers,
  getPendingUsers,
  approveUser,
  deleteUser,
  hasRole,
  authenticateJWT,
  authorize,
  // Export users for testing
  getUsers: () => users
}; 