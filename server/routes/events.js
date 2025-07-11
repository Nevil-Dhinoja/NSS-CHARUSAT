const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/reports/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'report-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['.doc', '.docx', '.pdf', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only .doc, .docx, .pdf, and .txt files are allowed'));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Get all events (for PC - all departments, for PO - their department only)
router.get('/all', verifyToken, (req, res) => {
  const userRole = req.user.role?.toLowerCase();
  const userDepartment = req.user.department;
  const userId = req.user.id;
  
  let sql = `
    SELECT e.*, d.name as department_name, au.name as created_by_name
    FROM events e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN assigned_users au ON e.created_by = au.id
    ORDER BY e.event_date DESC, e.created_at DESC
  `;
  
  let params = [];
  
  // For PO users, only show events from their department
  if (userRole === 'po' || userRole === 'program officer') {
    // If userDepartment is undefined, get it from database
    if (!userDepartment) {
      const userSql = 'SELECT au.department_id, d.name as department_name FROM assigned_users au LEFT JOIN departments d ON au.department_id = d.id WHERE au.id = ?';
      db.query(userSql, [userId], (err, userResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (userResults.length === 0 || !userResults[0].department_id) {
          return res.status(400).json({ error: 'User department not found' });
        }
        
        const departmentName = userResults[0].department_name;
        
        // Query events for this department
        const eventsSql = `
          SELECT e.*, d.name as department_name, au.name as created_by_name
          FROM events e
          LEFT JOIN departments d ON e.department_id = d.id
          LEFT JOIN assigned_users au ON e.created_by = au.id
          WHERE e.department_id = ?
          ORDER BY e.event_date DESC, e.created_at DESC
        `;
        
        db.query(eventsSql, [userResults[0].department_id], (err, results) => {
          if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
          res.json(results);
        });
      });
      return;
    }
    
    // If userDepartment is defined, use the original logic
    sql = `
      SELECT e.*, d.name as department_name, au.name as created_by_name
      FROM events e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN assigned_users au ON e.created_by = au.id
      WHERE d.name = ? OR d.name = ?
      ORDER BY e.event_date DESC, e.created_at DESC
    `;
    params = [userDepartment, userDepartment + ' Engineering'];
  }
  
  db.query(sql, params, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});

// Get events for specific department (for SC users)
router.get('/department/:department', verifyToken, (req, res) => {
  const { department } = req.params;
  const userRole = req.user.role?.toLowerCase();
  
  // Only allow SC users to view department events
  if (userRole !== 'sc' && userRole !== 'student coordinator') {
    return res.status(403).json({ error: 'Access denied. Only Student Coordinators can view department events.' });
  }
  
  const sql = `
    SELECT e.*, d.name as department_name, au.name as created_by_name
    FROM events e
    LEFT JOIN departments d ON e.department_id = d.id
    LEFT JOIN assigned_users au ON e.created_by = au.id
    WHERE d.name = ? OR d.name = ?
    ORDER BY e.event_date DESC, e.created_at DESC
  `;
  
  const deptName = department.endsWith(' Engineering') ? department : department + ' Engineering';
  
  db.query(sql, [department, deptName], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});

// Add new event
router.post('/add', verifyToken, (req, res) => {
  const { event_name, event_date, event_mode, description } = req.body;
  const createdBy = req.user.id;
  const userDepartment = req.user.department;
  

  
  // Check if user has permission to add events
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can add events.' });
  }

  if (!event_name || !event_date || !event_mode || !description) {
    return res.status(400).json({ error: 'Event name, date, mode, and description are required' });
  }

  // Validate event mode
  const validModes = ['online', 'offline', 'hybrid'];
  if (!validModes.includes(event_mode.toLowerCase())) {
    return res.status(400).json({ error: 'Event mode must be online, offline, or hybrid' });
  }

  // Get department ID
  const deptSql = 'SELECT id FROM departments WHERE name = ? OR name = ?';
  
  // Handle undefined department - try to get from database
  if (!userDepartment) {
    const userSql = 'SELECT au.department_id, d.name as department_name FROM assigned_users au LEFT JOIN departments d ON au.department_id = d.id WHERE au.id = ?';
    db.query(userSql, [createdBy], (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (userResults.length === 0 || !userResults[0].department_id) {
        return res.status(400).json({ error: 'User department not found. Please update your profile with department information.' });
      }
      
      const departmentId = userResults[0].department_id;
      const departmentName = userResults[0].department_name;
      
      // Determine event status based on date
      const eventDate = new Date(event_date);
      const currentDate = new Date();
      const status = eventDate > currentDate ? 'upcoming' : 'completed';
      
      // Insert new event
      const insertSql = `
        INSERT INTO events (event_name, event_date, event_mode, department_id, description, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const insertValues = [event_name, event_date, event_mode.toLowerCase(), departmentId, description, status, createdBy];
      
      db.query(insertSql, insertValues, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        res.status(201).json({ 
          message: 'Event added successfully',
          id: result.insertId,
          status: status
        });
      });
    });
    return;
  }
  
  const deptName = userDepartment.endsWith(' Engineering') ? userDepartment : userDepartment + ' Engineering';
  
  db.query(deptSql, [userDepartment, deptName], (err, deptResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (deptResults.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    const departmentId = deptResults[0].id;
    
    // Determine event status based on date
    const eventDate = new Date(event_date);
    const currentDate = new Date();
    const status = eventDate > currentDate ? 'upcoming' : 'completed';
    
    // Insert new event
    const insertSql = `
      INSERT INTO events (event_name, event_date, event_mode, department_id, description, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const insertValues = [event_name, event_date, event_mode.toLowerCase(), departmentId, description, status, createdBy];
    
    db.query(insertSql, insertValues, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      res.status(201).json({ 
        message: 'Event added successfully',
        id: result.insertId,
        status: status
      });
    });
  });
});

// Update event
router.put('/update/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { event_name, event_date, event_mode, description } = req.body;
  
  // Check if user has permission to edit events
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can edit events.' });
  }

  if (!event_name || !event_date || !event_mode || !description) {
    return res.status(400).json({ error: 'Event name, date, mode, and description are required' });
  }

  // Validate event mode
  const validModes = ['online', 'offline', 'hybrid'];
  if (!validModes.includes(event_mode.toLowerCase())) {
    return res.status(400).json({ error: 'Event mode must be online, offline, or hybrid' });
  }

  // Determine event status based on date
  const eventDate = new Date(event_date);
  const currentDate = new Date();
  const status = eventDate > currentDate ? 'upcoming' : 'completed';
  
  // Update event
  const updateSql = `
    UPDATE events 
    SET event_name = ?, event_date = ?, event_mode = ?, description = ?, status = ?
    WHERE id = ?
  `;
  
  db.query(updateSql, [event_name, event_date, event_mode.toLowerCase(), description, status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event updated successfully' });
  });
});

// Delete event
router.delete('/delete/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  // Check if user has permission to delete events
  const userRole = req.user.role?.toLowerCase();
  const allowedRoles = ['pc', 'po', 'program coordinator', 'program officer'];
  
  if (!allowedRoles.includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Coordinators and Program Officers can delete events.' });
  }

  // Check if event exists
  const checkSql = 'SELECT id, event_name FROM events WHERE id = ?';
  
  db.query(checkSql, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete the event
    const deleteSql = 'DELETE FROM events WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      res.json({ 
        message: 'Event deleted successfully',
        deletedEvent: results[0].event_name
      });
    });
  });
});

// Submit event report (for SC users)
router.post('/submit-report', verifyToken, upload.single('report_file'), (req, res) => {
  const { event_id, submitted_by } = req.body;
  const submittedById = req.user.id;
  
  // Check if user has permission to submit reports
  const userRole = req.user.role?.toLowerCase();
  if (userRole !== 'sc' && userRole !== 'student coordinator') {
    return res.status(403).json({ error: 'Access denied. Only Student Coordinators can submit reports.' });
  }

  if (!event_id || !submitted_by || !req.file) {
    return res.status(400).json({ error: 'Event ID, submitted by, and report file are required' });
  }

  // Check if event exists and is from user's department
  const eventSql = `
    SELECT e.*, d.name as department_name 
    FROM events e 
    LEFT JOIN departments d ON e.department_id = d.id 
    WHERE e.id = ?
  `;
  
  db.query(eventSql, [event_id], (err, eventResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (eventResults.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResults[0];
    
    // Check if user is from the same department as the event
    const userSql = 'SELECT department_id FROM assigned_users WHERE id = ?';
    db.query(userSql, [submittedById], (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (userResults.length === 0 || userResults[0].department_id !== event.department_id) {
        return res.status(403).json({ error: 'Access denied. You can only submit reports for events in your department.' });
      }
      
      // Check if user already submitted a report for this event
      const checkSql = 'SELECT id FROM event_reports WHERE event_id = ? AND submitted_by_id = ?';
      db.query(checkSql, [event_id, submittedById], (err, reportResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (reportResults.length > 0) {
          return res.status(400).json({ 
            error: 'You have already submitted a report for this event. Please delete the existing report first before uploading a new one.' 
          });
        }
        
        // Insert the report
        const insertSql = `
          INSERT INTO event_reports (event_id, file_path, submitted_by, submitted_by_id, status, created_at)
          VALUES (?, ?, ?, ?, 'pending', NOW())
        `;
        
        const filePath = req.file.path;
        
        db.query(insertSql, [event_id, filePath, submitted_by, submittedById], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
          
          res.status(201).json({ 
            message: 'Report submitted successfully',
            report_id: result.insertId
          });
        });
      });
    });
  });
});

// Get reports for approval (for PO users) or own reports (for SC users)
router.get('/reports', verifyToken, (req, res) => {
  const userRole = req.user.role?.toLowerCase();
  const userId = req.user.id;
  
  if (userRole !== 'po' && userRole !== 'program officer' && userRole !== 'sc' && userRole !== 'student coordinator') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers and Student Coordinators can view reports.' });
  }
  
  // Get user's department
  const userSql = 'SELECT department_id FROM assigned_users WHERE id = ?';
  db.query(userSql, [userId], (err, userResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (userResults.length === 0) {
      return res.status(400).json({ error: 'User department not found' });
    }
    
    const departmentId = userResults[0].department_id;
    
    let reportsSql;
    let params;
    
    if (userRole === 'po' || userRole === 'program officer') {
      // PO sees all reports from their department
      reportsSql = `
        SELECT er.*, e.event_name, e.event_date, d.name as department_name, au.name as submitted_by_name
        FROM event_reports er
        LEFT JOIN events e ON er.event_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN assigned_users au ON er.submitted_by_id = au.id
        WHERE e.department_id = ?
        ORDER BY er.created_at DESC
      `;
      params = [departmentId];
    } else {
      // SC sees only their own submitted reports
      reportsSql = `
        SELECT er.*, e.event_name, e.event_date, d.name as department_name, au.name as submitted_by_name
        FROM event_reports er
        LEFT JOIN events e ON er.event_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        LEFT JOIN assigned_users au ON er.submitted_by_id = au.id
        WHERE er.submitted_by_id = ?
        ORDER BY er.created_at DESC
      `;
      params = [userId];
    }
    
    db.query(reportsSql, params, (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json(results);
    });
  });
});

// Approve/Reject report (for PO users)
router.put('/reports/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status, comments } = req.body;
  const userId = req.user.id;
  
  const userRole = req.user.role?.toLowerCase();
  if (userRole !== 'po' && userRole !== 'program officer') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can approve/reject reports.' });
  }
  
  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be either approved or rejected' });
  }
  
  // Check if report exists and user has permission
  const checkSql = `
    SELECT er.*, e.department_id 
    FROM event_reports er
    LEFT JOIN events e ON er.event_id = e.id
    WHERE er.id = ?
  `;
  
  db.query(checkSql, [id], (err, reportResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (reportResults.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    const report = reportResults[0];
    
    // Check if user is from the same department
    const userSql = 'SELECT department_id FROM assigned_users WHERE id = ?';
    db.query(userSql, [userId], (err, userResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (userResults.length === 0 || userResults[0].department_id !== report.department_id) {
        return res.status(403).json({ error: 'Access denied. You can only approve/reject reports from your department.' });
      }
      
      // Update report status
      const updateSql = `
        UPDATE event_reports 
        SET status = ?, comments = ?, approved_by = ?, approved_at = NOW()
        WHERE id = ?
      `;
      
      db.query(updateSql, [status, comments, userId, id], (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        res.json({ 
          message: `Report ${status} successfully`,
          status: status
        });
      });
    });
  });
});

// Download report file
router.get('/reports/:id/download', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role?.toLowerCase();

  // Only PO and PC can download reports
  if (!['po', 'pc', 'program officer', 'program coordinator'].includes(userRole)) {
    return res.status(403).json({ error: 'Access denied. Only Program Officers and Program Coordinators can download reports.' });
  }

  // Get report details
  const reportSql = `
    SELECT er.*, e.department_id 
    FROM event_reports er
    LEFT JOIN events e ON er.event_id = e.id
    WHERE er.id = ?
  `;

  db.query(reportSql, [id], (err, reportResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (reportResults.length === 0) {
      return res.status(404).json({ error: 'Report not found' });
    }
    const report = reportResults[0];

    if (userRole === 'po' || userRole === 'program officer') {
      // PO: only from their department
      const userSql = 'SELECT department_id FROM assigned_users WHERE id = ?';
      db.query(userSql, [userId], (err, userResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        if (userResults.length === 0 || userResults[0].department_id !== report.department_id) {
          return res.status(403).json({ error: 'Access denied. You can only download reports from your department.' });
        }
        res.download(report.file_path);
      });
    } else {
      // PC: can download any report
      res.download(report.file_path);
    }
  });
});

// Delete report (for SC users - only their own reports)
router.delete('/reports/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role?.toLowerCase();
  
  if (userRole !== 'sc' && userRole !== 'student coordinator') {
    return res.status(403).json({ error: 'Access denied. Only Student Coordinators can delete their own reports.' });
  }
  
  // Check if report exists and belongs to the user
  const checkSql = 'SELECT * FROM event_reports WHERE id = ? AND submitted_by_id = ?';
  db.query(checkSql, [id, userId], (err, reportResults) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (reportResults.length === 0) {
      return res.status(404).json({ error: 'Report not found or you do not have permission to delete it.' });
    }
    
    const report = reportResults[0];
    
    // Only allow deletion if status is pending or rejected
    if (report.status !== 'pending' && report.status !== 'rejected') {
      return res.status(400).json({ error: 'You can only delete reports that are still pending or have been rejected.' });
    }
    
    // Delete the report
    const deleteSql = 'DELETE FROM event_reports WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      res.json({ message: 'Report deleted successfully' });
    });
  });
});

// Delete report by PO/PC (from their department)
router.delete('/reports/admin-delete/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role?.toLowerCase();
  
  // Only PO and PC can delete reports
  if (userRole !== 'po' && userRole !== 'program officer' && userRole !== 'pc' && userRole !== 'program coordinator') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers and Program Coordinators can delete reports.' });
  }
  
  if (userRole === 'po' || userRole === 'program officer') {
    // For PO users, check if they can delete this specific report
    const getDeptSql = 'SELECT department_id FROM assigned_users WHERE id = ? LIMIT 1';
    
    db.query(getDeptSql, [userId], (err, deptResults) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      if (!deptResults || deptResults.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const userDepartmentId = deptResults[0].department_id;
      
      // Check if the report belongs to PO's department
      const checkSql = `
        SELECT er.id FROM event_reports er
        LEFT JOIN events e ON er.event_id = e.id
        WHERE er.id = ? AND e.department_id = ?
      `;
      
      db.query(checkSql, [id, userDepartmentId], (err, checkResults) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        
        if (checkResults.length === 0) {
          return res.status(403).json({ error: 'Access denied. You can only delete reports from your department.' });
        }
        
        // Delete the report
        const deleteSql = 'DELETE FROM event_reports WHERE id = ?';
        db.query(deleteSql, [id], (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }

          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Report not found' });
          }

          res.json({ message: 'Report deleted successfully' });
        });
      });
    });
  } else {
    // For PC users, allow deleting any report
    const deleteSql = 'DELETE FROM event_reports WHERE id = ?';
    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Report not found' });
      }

      res.json({ message: 'Report deleted successfully' });
    });
  }
});

module.exports = router; 