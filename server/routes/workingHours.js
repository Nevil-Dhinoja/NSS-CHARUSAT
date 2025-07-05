const express = require('express');
const router = express.Router();
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');

// Add working hours entry
router.post('/addWorkingHours', verifyToken, (req, res) => {
  const { activity_name, date, start_time, end_time, description } = req.body;
  const user_id = req.user.id;

  if (!activity_name || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO working_hours 
      (user_id, activity_name, date, start_time, end_time, description) 
    VALUES (?, ?, ?, ?, ?, ?)`;

  db.query(sql, [user_id, activity_name, date, start_time, end_time, description], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.status(200).json({ 
      message: 'Working hours added successfully',
      id: result.insertId 
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

// Get working hours for CE department (Program Officers only)
router.get('/department/:department', verifyToken, (req, res) => {
  // Check if user is Program Officer
  if (req.user.role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can view working hours.' });
  }

  const sql = `
    SELECT wh.*, au.name as student_name, au.department 
    FROM working_hours wh
    JOIN assigned_users au ON wh.user_id = au.id
    WHERE au.department = 'CE'
    ORDER BY wh.date DESC, wh.created_at DESC`;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.json(results);
  });
});

// Get all working hours for approval (Program Officers only)
router.get('/all', verifyToken, (req, res) => {
  // Check if user is Program Officer
  if (req.user.role !== 'po') {
    return res.status(403).json({ error: 'Access denied. Only Program Officers can view all working hours.' });
  }

  const sql = `
    SELECT wh.*, au.name as student_name, au.department 
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

  // Check if user is Program Officer
  if (req.user.role !== 'po') {
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

  // Check if user is Program Officer
  if (req.user.role !== 'po') {
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

  // Check if user is Program Officer
  if (req.user.role !== 'po') {
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