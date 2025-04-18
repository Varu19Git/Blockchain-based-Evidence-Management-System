const express = require('express');
const router = express.Router();
const auth = require('../utils/auth');

/**
 * @route POST /api/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    const user = auth.authenticateUser(username, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = auth.generateToken(user);
    
    // Return user and token
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', (req, res) => {
  const { username, password, firstName, lastName, email, department, role } = req.body;
  
  // Basic validation
  if (!username || !password || !firstName || !lastName || !email || !department) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    const newUser = auth.registerUser({
      username,
      password,
      firstName,
      lastName,
      email,
      department,
      role
    });
    
    return res.status(201).json({
      message: 'Registration successful. Your account is pending admin approval.',
      user: newUser
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 * @access Private
 */
router.get('/me', auth.authenticateJWT, (req, res) => {
  return res.status(200).json({ user: req.user });
});

/**
 * @route GET /api/auth/users
 * @desc Get all users (admin only)
 * @access Private/Admin
 */
router.get('/users', auth.authenticateJWT, auth.authorize(auth.ROLES.ADMIN), (req, res) => {
  const users = auth.getAllUsers();
  return res.status(200).json({ users });
});

/**
 * @route GET /api/auth/users/pending
 * @desc Get users pending approval (admin only)
 * @access Private/Admin
 */
router.get('/users/pending', auth.authenticateJWT, auth.authorize(auth.ROLES.ADMIN), (req, res) => {
  const pendingUsers = auth.getPendingUsers();
  return res.status(200).json({ users: pendingUsers });
});

/**
 * @route PUT /api/auth/users/:userId/approve
 * @desc Approve a user (admin only)
 * @access Private/Admin
 */
router.put('/users/:userId/approve', auth.authenticateJWT, auth.authorize(auth.ROLES.ADMIN), (req, res) => {
  const { userId } = req.params;
  
  const updatedUser = auth.approveUser(userId);
  
  if (!updatedUser) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.status(200).json({ 
    message: 'User approved successfully',
    user: updatedUser
  });
});

/**
 * @route DELETE /api/auth/users/:userId
 * @desc Delete a user (admin only)
 * @access Private/Admin
 */
router.delete('/users/:userId', auth.authenticateJWT, auth.authorize(auth.ROLES.ADMIN), (req, res) => {
  const { userId } = req.params;
  
  const success = auth.deleteUser(userId);
  
  if (!success) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.status(200).json({ message: 'User deleted successfully' });
});

module.exports = router; 