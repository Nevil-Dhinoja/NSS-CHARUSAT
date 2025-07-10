const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const { sendWelcomeEmail, sendNotificationToPO } = require('../services/emailService');

// Login route
router.post('/login', async (req, res) => {
  const { login_id, password, role } = req.body;

  const sql = `SELECT assigned_users.*, roles.role_name, departments.name as department_name, assigned_users.password_hash as password
               FROM assigned_users 
               LEFT JOIN roles ON assigned_users.role_id = roles.id
               LEFT JOIN departments ON assigned_users.department_id = departments.id
               WHERE assigned_users.login_id = ?`;

  db.query(sql, [login_id], async (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result[0];

    // Validate that the user's actual role matches the selected role
    if (role) {
      const roleMapping = {
        'pc': 'Program Coordinator',
        'po': 'Program Officer', 
        'sc': 'Student Coordinator'
      };
      const expectedRole = roleMapping[role.toLowerCase()];
      
      if (role && user.role_name !== expectedRole) {
        return res.status(401).json({ 
          success: false, 
          message: `Access denied. You are registered as ${user.role_name}, not ${expectedRole}` 
        });
      }
    }

    // Check if user has a password
    if (!user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials - no password set' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        role: user.role_name, 
        department: user.department_name,
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role_name,
        department: user.department_name,
        email: user.email
      }
    });
  });
});

// Add Student Coordinator (PO only)
router.post('/add-student-coordinator', verifyToken, async (req, res) => {
  const { name, email, department } = req.body;
  const poId = req.user.id;
  const poRole = req.user.role?.toLowerCase();

  // Only PO can add SC
  if (poRole !== 'po' && poRole !== 'program officer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only Program Officers can add Student Coordinators.' 
    });
  }

  // Validate required fields
  if (!name || !email || !department) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required: name, email, department' 
    });
  }

  try {
    // Check if email already exists
    const checkEmailSql = 'SELECT id FROM assigned_users WHERE email = ?';
    db.query(checkEmailSql, [email], async (err, emailResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (emailResult.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'A user with this email already exists' 
        });
      }

      // Get department ID
      const deptSql = 'SELECT id FROM departments WHERE name = ? OR name = ?';
      db.query(deptSql, [department, department + ' Engineering'], async (err, deptResult) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (deptResult.length === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Department not found' 
          });
        }

        const departmentId = deptResult[0].id;

        // Get SC role ID
        const roleSql = 'SELECT id FROM roles WHERE role_name = ?';
        db.query(roleSql, ['Student Coordinator'], async (err, roleResult) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
          }

          if (roleResult.length === 0) {
            return res.status(404).json({ 
              success: false, 
              message: 'Student Coordinator role not found' 
            });
          }

          const roleId = roleResult[0].id;

          // Generate default password
          const defaultPassword = 'NSS@' + Math.random().toString(36).substring(2, 8).toUpperCase();
          const hashedPassword = await bcrypt.hash(defaultPassword, 10);

          // Generate login ID (email without domain)
          const loginId = email.split('@')[0];

          // Insert new SC
          const insertSql = `
            INSERT INTO assigned_users (name, email, login_id, password_hash, department_id, role_id)
            VALUES (?, ?, ?, ?, ?, ?)
          `;

          db.query(insertSql, [name, email, loginId, hashedPassword, departmentId, roleId], async (err, result) => {
            if (err) {
              return res.status(500).json({ success: false, message: 'Database error' });
            }

            const scId = result.insertId;
            
            const po = {
              name: req.user.name,
              email: req.user.email
            };

            let emailResult = { success: false };
            let notificationResult = { success: false };

            try {
              // Send welcome email to SC
              emailResult = await sendWelcomeEmail(
                email, 
                name, 
                po.name, 
                po.email, 
                department, 
                defaultPassword
              );
            } catch (emailError) {
              // Continue without failing the entire operation
            }

            try {
              // Send notification to PO
              notificationResult = await sendNotificationToPO(
                po.email,
                po.name,
                name,
                email,
                department
              );
            } catch (notificationError) {
              // Continue without failing the entire operation
            }

            res.status(201).json({
              success: true,
              message: 'Student Coordinator added successfully',
              sc: {
                id: scId,
                name,
                email,
                department,
                loginId,
                defaultPassword
              },
              emailSent: emailResult.success,
              notificationSent: notificationResult.success
            });
          });
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update Student Coordinator (PO only)
router.put('/student-coordinator/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const poRole = req.user.role?.toLowerCase();

  // Only PO can update SC
  if (poRole !== 'po' && poRole !== 'program officer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only Program Officers can update Student Coordinators.' 
    });
  }

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'All fields are required: name, email' 
    });
  }

  try {
    // Check if email already exists for other users
    const checkEmailSql = 'SELECT id FROM assigned_users WHERE email = ? AND id != ?';
    db.query(checkEmailSql, [email, id], async (err, emailResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (emailResult.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: 'A user with this email already exists' 
        });
      }

      // Update SC
      const updateSql = `
        UPDATE assigned_users 
        SET name = ?, email = ?, login_id = ?
        WHERE id = ? AND role_id = (SELECT id FROM roles WHERE role_name = 'Student Coordinator')
      `;

      const loginId = email.split('@')[0];

      db.query(updateSql, [name, email, loginId, id], async (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Student Coordinator not found or access denied' 
          });
        }

        res.json({
          success: true,
          message: 'Student Coordinator updated successfully',
          sc: {
            id,
            name,
            email,
            loginId
          }
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Delete Student Coordinator (PO only)
router.delete('/student-coordinator/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const poRole = req.user.role?.toLowerCase();

  // Only PO can delete SC
  if (poRole !== 'po' && poRole !== 'program officer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only Program Officers can delete Student Coordinators.' 
    });
  }

  try {
    // Get SC details before deletion for confirmation
    const getScSql = `
      SELECT au.name, au.email, d.name as department_name
      FROM assigned_users au
      LEFT JOIN departments d ON au.department_id = d.id
      WHERE au.id = ? AND au.role_id = (SELECT id FROM roles WHERE role_name = 'Student Coordinator')
    `;

    db.query(getScSql, [id], async (err, scResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (scResult.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Student Coordinator not found' 
        });
      }

      const sc = scResult[0];

      // Delete SC
      const deleteSql = `
        DELETE FROM assigned_users 
        WHERE id = ? AND role_id = (SELECT id FROM roles WHERE role_name = 'Student Coordinator')
      `;

      db.query(deleteSql, [id], async (err, result) => {
        if (err) {
          return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Student Coordinator not found or access denied' 
          });
        }

        res.json({
          success: true,
          message: `Student Coordinator ${sc.name} has been deleted successfully`,
          deletedSc: sc
        });
      });
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Test route to debug routing
router.get('/test-route', (req, res) => {
  res.json({ message: 'Test route working' });
});

// Get all Student Coordinators (for PO to see their SCs)
router.get('/student-coordinators', verifyToken, (req, res) => {
  const poId = req.user.id;
  const poRole = req.user.role?.toLowerCase();

  // Only PO can view their SCs
  if (poRole !== 'po' && poRole !== 'program officer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only Program Officers can view Student Coordinators.' 
    });
  }

  const sql = `
    SELECT au.id, au.name, au.email, au.created_at, d.name as department_name
    FROM assigned_users au
    LEFT JOIN departments d ON au.department_id = d.id
    LEFT JOIN roles r ON au.role_id = r.id
    WHERE r.role_name = 'Student Coordinator' AND d.name = ?
    ORDER BY au.created_at DESC
  `;

  db.query(sql, [req.user.department], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json({
      success: true,
      studentCoordinators: result
    });
  });
});

// Get users by role
router.get('/users/:role', verifyToken, (req, res) => {
  const roleName = decodeURIComponent(req.params.role);
  
  const sql = `
    SELECT au.*, r.role_name, d.name as department_name, i.name as institute_name
    FROM assigned_users au
    LEFT JOIN roles r ON au.role_id = r.id
    LEFT JOIN departments d ON au.department_id = d.id
    LEFT JOIN institutes i ON d.institute_id = i.id
    WHERE r.role_name = ?
    ORDER BY au.name
  `;

  db.query(sql, [roleName], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json(result);
  });
});

// Get all institutes
router.get('/institutes', verifyToken, (req, res) => {
  const sql = 'SELECT * FROM institutes ORDER BY name';
  
  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json(result);
  });
});

// Get departments by institute
router.get('/departments/:instituteId', verifyToken, (req, res) => {
  const instituteId = req.params.instituteId;
  
  const sql = 'SELECT * FROM departments WHERE institute_id = ? ORDER BY name';
  
  db.query(sql, [instituteId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    res.json(result);
  });
});

// Get user profile
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

  db.query(sql, [userId], (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = result[0];
    res.json({
      id: user.id,
      name: user.name,
      login_id: user.login_id,
      email: user.email,
      role_id: user.role_id,
      role_name: user.role_name,
      department_id: user.department_id,
      department_name: user.department_name,
      institute: user.institute_name
    });
  });
});

// Update user profile
router.put('/profile', verifyToken, (req, res) => {
  const userId = req.user.id;
  const { name, email, login_id } = req.body;

  // Validate required fields
  if (!name || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Name and email are required' 
    });
  }

  // Check if email already exists for other users
  const checkEmailSql = 'SELECT id FROM assigned_users WHERE email = ? AND id != ?';
  db.query(checkEmailSql, [email, userId], (err, emailResult) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }

    if (emailResult.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'A user with this email already exists' 
      });
    }

    // Update user profile
    const updateSql = `
      UPDATE assigned_users 
      SET name = ?, email = ?, login_id = ?
      WHERE id = ?
    `;

    db.query(updateSql, [name, email, login_id, userId], (err, result) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      res.json({
        success: true,
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
});

module.exports = router;
