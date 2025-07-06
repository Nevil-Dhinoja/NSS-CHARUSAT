const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/authController.js');
const verifyToken = require('../middleware/verifyToken');
const bcrypt = require('bcryptjs');
const db = require('../db');

router.post('/login', loginUser);

// Get users by role
router.get('/users/:role', verifyToken, (req, res) => {
  const { role } = req.params;
  
  // Check if user has permission to view users
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can view users.' });
  }

  const sql = `
    SELECT au.*, r.role_name, d.name as department_name, i.name as institute_name
    FROM assigned_users au
    LEFT JOIN roles r ON au.role_id = r.id
    LEFT JOIN departments d ON au.department_id = d.id
    LEFT JOIN institutes i ON d.institute_id = i.id
    WHERE r.role_name = ?
    ORDER BY au.name ASC
  `;
  
  db.query(sql, [role], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    res.json(results);
  });
});

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

// Add new student leader
router.post('/users/student-coordinator', verifyToken, async (req, res) => {
  const { name, login_id, email, department } = req.body;
  
  // Check if user has permission to add users
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can add users.' });
  }

  if (!name || !login_id || !email || !department) {
    return res.status(400).json({ error: 'Name, login ID, email, and department are required' });
  }

  try {
    // Get role ID for Student Coordinator
    const roleSql = 'SELECT id FROM roles WHERE role_name = "Student Coordinator"';
    db.query(roleSql, async (err, roleResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (roleResults.length === 0) {
        return res.status(404).json({ error: 'Student Coordinator role not found' });
      }
      
      const roleId = roleResults[0].id;
      
      // Get department ID
      const deptSql = 'SELECT id FROM departments WHERE name = ? OR name = ?';
      const deptName = department.endsWith(' Engineering') ? department : department + ' Engineering';
      db.query(deptSql, [department, deptName], async (err, deptResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (deptResults.length === 0) {
          return res.status(404).json({ error: 'Department not found' });
        }
        
        const departmentId = deptResults[0].id;
        
        // Check if login_id already exists
        const checkSql = 'SELECT id FROM assigned_users WHERE login_id = ?';
        db.query(checkSql, [login_id], async (err, checkResults) => {
          if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
          
          if (checkResults.length > 0) {
            return res.status(409).json({ error: 'Login ID already exists' });
          }
          
          // Check if email already exists
          const emailCheckSql = 'SELECT id FROM assigned_users WHERE email = ?';
          db.query(emailCheckSql, [email], async (err, emailCheckResults) => {
            if (err) {
              return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            if (emailCheckResults.length > 0) {
              return res.status(409).json({ error: 'Email already exists' });
            }
            
            // Generate a default password (you might want to send this via email)
            const defaultPassword = 'nss123456';
            const saltRounds = 10;
            const passwordHash = await bcrypt.hash(defaultPassword, saltRounds);
            
            // Insert new user
            const insertSql = `
              INSERT INTO assigned_users (name, login_id, email, password_hash, role_id, department_id)
              VALUES (?, ?, ?, ?, ?, ?)
            `;
            
            db.query(insertSql, [name, login_id, email, passwordHash, roleId, departmentId], (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Database error', details: err.message });
              }
              
              res.status(201).json({ 
                message: 'Student Coordinator added successfully',
                id: result.insertId,
                defaultPassword: defaultPassword
              });
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update student leader
router.put('/users/student-coordinator/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, login_id, email, department } = req.body;
  
  // Check if user has permission to edit users
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can edit users.' });
  }

  if (!name || !login_id || !email || !department) {
    return res.status(400).json({ error: 'Name, login ID, email, and department are required' });
  }

  try {
    // Get department ID
    const deptSql = 'SELECT id FROM departments WHERE name = ? OR name = ?';
    const deptName = department.endsWith(' Engineering') ? department : department + ' Engineering';
    db.query(deptSql, [department, deptName], async (err, deptResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (deptResults.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      const departmentId = deptResults[0].id;
      
      // Check if login_id already exists (excluding current user)
      const checkSql = 'SELECT id FROM assigned_users WHERE login_id = ? AND id != ?';
      db.query(checkSql, [login_id, id], async (err, checkResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (checkResults.length > 0) {
          return res.status(409).json({ error: 'Login ID already exists' });
        }
        
        // Check if email already exists (excluding current user)
        const emailCheckSql = 'SELECT id FROM assigned_users WHERE email = ? AND id != ?';
        db.query(emailCheckSql, [email, id], async (err, emailCheckResults) => {
          if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
          
          if (emailCheckResults.length > 0) {
            return res.status(409).json({ error: 'Email already exists' });
          }
          
          // Update user
          const updateSql = `
            UPDATE assigned_users 
            SET name = ?, login_id = ?, email = ?, department_id = ?
            WHERE id = ?
          `;
          
          db.query(updateSql, [name, login_id, email, departmentId, id], (err, result) => {
            if (err) {
              return res.status(500).json({ error: 'Database error', details: err.message });
            }
            
            if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'User not found' });
            }
            
            res.json({ message: 'Student Coordinator updated successfully' });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Delete student leader
router.delete('/users/student-coordinator/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  // Check if user has permission to delete users
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can delete users.' });
  }

  // Check if user exists and is a Student Coordinator
  const checkSql = `
    SELECT au.id, au.name, r.role_name
    FROM assigned_users au
    LEFT JOIN roles r ON au.role_id = r.id
    WHERE au.id = ? AND r.role_name = 'Student Coordinator'
  `;
  
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Student Coordinator not found' });
    }
    
    // Delete the user
    const deleteSql = 'DELETE FROM assigned_users WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      res.json({ 
        message: 'Student Coordinator deleted successfully',
        deletedUser: results[0].name
      });
    });
  });
});

module.exports = router;
