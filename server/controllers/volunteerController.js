const db = require('../db');




exports.addVolunteer = (req, res) => {
    const { name, studentId, department, year, email, phone } = req.body;
  
    if (!name || !studentId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
  
    const sql = `
      INSERT INTO volunteers 
        (name, student_id, department, year, contact, joined_on, added_by) 
      VALUES (?, ?, ?, ?, ?, CURDATE(), ?)`;
  
    db.query(sql, [name, studentId, department, year, phone, req.user.id], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'Volunteer with this Student ID already exists' });
        }
        return res.status(500).json({ error: 'Database error', details: err });
      }
  
      res.status(200).json({ message: 'Volunteer added successfully' });
    });
  };
