const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController.js');
const verifyToken = require('../middleware/verifyToken');
const bcrypt = require('bcryptjs');
const db = require('../db');

router.post('/login', loginUser);

// Get user profile details
router.get('/profile', verifyToken, (req, res) => {
  const userId = req.user.id;
  
  const sql = `
    SELECT au.*, r.role_name, d.name as department_name, i.name as institute_name
    FROM assigned_users au
    LEFT JOIN roles r ON au.role_id = r.id
    LEFT JOIN departments d ON au.department_id = d.id
    LEFT JOIN institutes i ON d.institute_id = i.id
    WHERE au.id = ?
  `;
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = results[0];
    res.json({
      id: user.id,
      name: user.name,
      login_id: user.login_id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      department_id: user.department_id,
      department_name: user.department_name,
      institute_name: user.institute_name
    });
  });
});

// Update user profile
router.put('/profile', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { name, email, login_id } = req.body;
  
  if (!name || !email || !login_id) {
    return res.status(400).json({ error: 'Name, email, and login ID are required' });
  }
  
  const sql = `
    UPDATE assigned_users 
    SET name = ?, email = ?, login_id = ?
    WHERE id = ?
  `;
  
  db.query(sql, [name, email, login_id, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name,
        email,
        login_id
      }
    });
  });
});

// Update user password
router.put('/password', verifyToken, async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;
  
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }
  
  try {
    // First, get the current password hash from the database
    const getPasswordSql = 'SELECT password_hash FROM assigned_users WHERE id = ?';
    
    db.query(getPasswordSql, [userId], async (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const currentPasswordHash = results[0].password_hash;
      
      // Verify the current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
      
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      
      // Hash the new password
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      
      // Update the password in the database
      const updatePasswordSql = 'UPDATE assigned_users SET password_hash = ? WHERE id = ?';
      
      db.query(updatePasswordSql, [newPasswordHash, userId], (updateErr, updateResult) => {
        if (updateErr) {
          return res.status(500).json({ error: 'Database error', details: updateErr.message });
        }
        
        if (updateResult.affectedRows === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ 
          message: 'Password updated successfully'
        });
      });
    });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
