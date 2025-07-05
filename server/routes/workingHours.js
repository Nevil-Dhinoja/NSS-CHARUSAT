const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const jwt = require('jsonwebtoken');

// Add working hours entry
router.post('/addWorkingHours', verifyToken, (req, res) => {
  console.log("🔍 addWorkingHours called");
  console.log("🔍 Request body:", req.body);
  console.log("🔍 User from token:", req.user);
  
  const { activity_name, date, start_time, end_time, description } = req.body;
  const user_id = req.user.id;

  console.log("🔍 Extracted data:", { activity_name, date, start_time, end_time, description, user_id });

  if (!activity_name || !date || !start_time || !end_time) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch department_id from assigned_users table
  const getDeptSql = 'SELECT department_id FROM assigned_users WHERE id = ? LIMIT 1';
  console.log("🔍 Executing SQL:", getDeptSql, "with user_id:", user_id);
  
  db.query(getDeptSql, [user_id], (err, results) => {
    if (err) {
      console.log("❌ Dept SQL error:", err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (!results || results.length === 0) {
      console.log("❌ No assigned_user found for user_id:", user_id);
      return res.status(404).json({ error: 'User not found' });
    }
    const department_id = results[0].department_id;
    console.log("✅ Found department_id:", department_id);

    const sql = `
      INSERT INTO working_hours 
        (user_id, activity_name, date, start_time, end_time, description, department_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [user_id, activity_name, date, start_time, end_time, description, department_id];
    console.log("🔍 Executing insert SQL:", sql);
    console.log("🔍 Values:", values);

    db.query(sql, values, (err, result) => {
      if (err) {
        console.log("❌ Insert error:", err.message);
        console.log("❌ Full error:", err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      console.log("✅ Insert successful! ID:", result.insertId);
      res.status(200).json({ 
        message: 'Working hours added successfully',
        id: result.insertId 
      });
    });
  });
});

// Get working hours for current user
router.get('/my-hours', verifyToken, (req, res) => {
  const user_id = req.user.id;
  
  const sql = `
    SELECT * FROM working_hours 
    WHERE user_id = ? 
    ORDER BY date DESC, created_at DESC`;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
  });
});

// Get working hours for specific department (Program Officers only)
router.get('/department/:department', verifyToken, (req, res) => {
  // Accept both 'PO' and 'Program Officer' (case-insensitive)
  const role = (req.user.role || '').toLowerCase();
  if (role !== 'program officer' && role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can view working hours.' });
  }

  const { department } = req.params;
  
  const sql = `
    SELECT wh.*, au.name as student_name, au.department_id 
    FROM working_hours wh
    JOIN assigned_users au ON wh.user_id = au.id
    WHERE au.department_id = ?
    ORDER BY wh.date DESC, wh.created_at DESC`;

  db.query(sql, [department], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});

// Get working hours for current user's department (Program Officers only)
router.get('/department/my', verifyToken, (req, res) => {
  console.log("🔍 /department/my called");
  console.log("🔍 User from token:", req.user);
  
  // Accept both 'PO' and 'Program Officer' (case-insensitive)
  const role = (req.user.role || '').toLowerCase();
  if (role !== 'program officer' && role !== 'po') {
    console.log("❌ Access denied - user role:", req.user.role);
    return res.status(403).json({ error: 'Access denied. Only Program Officers can view working hours.' });
  }

  const user_id = req.user.id;
  console.log("🔍 User ID:", user_id);
  
  // First get the user's department_id
  const getDeptSql = 'SELECT department_id FROM assigned_users WHERE id = ? LIMIT 1';
  console.log("🔍 Executing SQL:", getDeptSql, "with user_id:", user_id);
  
  db.query(getDeptSql, [user_id], (err, deptResults) => {
    if (err) {
      console.log("❌ Dept SQL error:", err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (!deptResults || deptResults.length === 0) {
      console.log("❌ No assigned_user found for user_id:", user_id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userDepartmentId = deptResults[0].department_id;
    console.log("✅ Found department_id:", userDepartmentId);
    
    // Then get working hours for that department
    const sql = `
      SELECT wh.*, au.name as student_name, au.department_id 
      FROM working_hours wh
      JOIN assigned_users au ON wh.user_id = au.id
      WHERE au.department_id = ?
      ORDER BY wh.date DESC, wh.created_at DESC`;

    console.log("🔍 Executing working hours query with department_id:", userDepartmentId);
    
    db.query(sql, [userDepartmentId], (err, results) => {
      if (err) {
        console.log("❌ Working hours query error:", err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      console.log("✅ Found", results.length, "working hours entries");
      res.json(results);
    });
  });
});

// Get all working hours for approval (Program Officers only)
router.get('/all', verifyToken, (req, res) => {
  // Accept both 'PO' and 'Program Officer' (case-insensitive)
  const role = (req.user.role || '').toLowerCase();
  if (role !== 'program officer' && role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can view all working hours.' });
  }

  const sql = `
    SELECT wh.*, au.name as student_name, au.department_id 
    FROM working_hours wh
    JOIN assigned_users au ON wh.user_id = au.id
    ORDER BY wh.date DESC, wh.created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
  });
});

// Update working hours entry (only by the user who created it)
router.put('/update/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { activity_name, date, start_time, end_time, description } = req.body;
  const user_id = req.user.id;

  if (!activity_name || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Calculate hours
  const start = new Date(`2000-01-01 ${start_time}`);
  const end = new Date(`2000-01-01 ${end_time}`);
  const hours = Math.max(0, (end - start) / (1000 * 60 * 60));

  const sql = `
    UPDATE working_hours 
    SET activity_name = ?, date = ?, start_time = ?, end_time = ?, hours = ?, description = ?
    WHERE id = ? AND user_id = ? AND status = 'pending'`;

  db.query(sql, [activity_name, date, start_time, end_time, hours, description, id, user_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Working hours entry not found, you do not have permission to edit it, or it has already been approved' });
    }

    res.json({ message: 'Working hours updated successfully' });
  });
});

// Update working hours status (approve/reject)
router.put('/update-status/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Accept both 'PO' and 'Program Officer' (case-insensitive)
  const role = (req.user.role || '').toLowerCase();
  if (role !== 'program officer' && role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can update status.' });
  }

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending, approved, or rejected.' });
  }

  const sql = 'UPDATE working_hours SET status = ? WHERE id = ?';

  db.query(sql, [status, id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Working hours entry not found' });
    }

    res.json({ message: 'Status updated successfully' });
  });
});

// Approve working hours entry
router.put('/approve/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  // Accept both 'PO' and 'Program Officer' (case-insensitive)
  const role = (req.user.role || '').toLowerCase();
  if (role !== 'program officer' && role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can approve working hours.' });
  }

  const sql = 'UPDATE working_hours SET status = "approved" WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Working hours entry not found' });
    }

    res.json({ message: 'Working hours approved successfully' });
  });
});

// Reject working hours entry
router.put('/reject/:id', verifyToken, (req, res) => {
  const { id } = req.params;

  // Accept both 'PO' and 'Program Officer' (case-insensitive)
  const role = (req.user.role || '').toLowerCase();
  if (role !== 'program officer' && role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can reject working hours.' });
  }

  const sql = 'UPDATE working_hours SET status = "rejected" WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Working hours entry not found' });
    }

    res.json({ message: 'Working hours rejected successfully' });
  });
});

// Delete working hours entry (only by the user who created it)
router.delete('/delete/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const sql = 'DELETE FROM working_hours WHERE id = ? AND user_id = ?';

  db.query(sql, [id, user_id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Working hours entry not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Working hours deleted successfully' });
  });
});
module.exports = router; 