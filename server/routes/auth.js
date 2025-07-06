const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController.js');
const verifyToken = require('../middleware/verifyToken');
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

module.exports = router;
