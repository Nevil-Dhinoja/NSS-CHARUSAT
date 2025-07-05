const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parse');
const xlsx = require('xlsx');
const fs = require('fs');
const db = require('../db');
const verifyToken = require('../middleware/verifyToken');
const { addVolunteer } = require('../controllers/volunteerController');

// Single volunteer add
router.post('/addVolunteer', verifyToken, addVolunteer);

// Set up multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    let volunteers = [];

    if (file.mimetype === 'text/csv') {
      // Parse CSV
      const content = fs.readFileSync(file.path, 'utf8');
      csv.parse(content, { columns: true, trim: true }, (err, records) => {
        if (err) return res.status(400).json({ error: 'CSV parse error' });
        volunteers = records;
        insertVolunteers(volunteers, req, res, file.path);
      });
    } else if (
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      // Parse Excel
      const workbook = xlsx.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      volunteers = xlsx.utils.sheet_to_json(sheet);
      insertVolunteers(volunteers, req, res, file.path);
    } else {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'Unsupported file type' });
    }
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err });
  }
});

// Helper function to insert volunteers
function insertVolunteers(volunteers, req, res, filePath) {
  if (!Array.isArray(volunteers) || volunteers.length === 0) {
    fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'No data found in file' });
  }

  const values = volunteers.map((v) => [
    v.name,
    v.studentId,
    v.department,
    v.year,
    v.email,
    v.contact,
    new Date(), // joined_on
    req.user.id, // added_by
  ]);

  const sql = `
    INSERT INTO volunteers
      (name, student_id, department, year, email, contact, joined_on, added_by)
    VALUES ?
  `;

  db.query(sql, [values], (err) => {
    fs.unlinkSync(filePath);
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err });
    }
    res.status(200).json({ message: 'Volunteers uploaded successfully' });
  });
}

// Get all volunteers
router.get('/all', verifyToken, (req, res) => {
  db.query('SELECT * FROM volunteers', (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json(results);
  });
});

router.put('/edit/:id', verifyToken, (req, res) => {
  const { name, student_id, department, year, email, contact } = req.body;
  const { id } = req.params;
  const sql = `
    UPDATE volunteers
    SET name = ?, student_id = ?, department = ?, year = ?, email = ?, contact = ?
    WHERE id = ?
  `;
  db.query(sql, [name, student_id, department, year, email, contact, id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error', details: err });
    res.json({ message: 'Volunteer updated successfully' });
  });
});

module.exports = router;
