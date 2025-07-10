const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const db = require('./db');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
const reportsDir = path.join(uploadsDir, 'reports');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.js');
app.use('/api/auth', authRoutes);
const volunteerRoutes = require('./routes/volunteers.js');
app.use('/api/volunteers', volunteerRoutes); 
const workingHoursRoutes = require('./routes/workingHours.js');
app.use('/api/working-hours', workingHoursRoutes);
const eventsRoutes = require('./routes/events.js');
app.use('/api/events', eventsRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

app.use(express.static(path.join(__dirname, '../client')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /api/auth/*');
  console.log('- /api/volunteers/*');
  console.log('- /api/working-hours/*');
  console.log('- /api/events/*');
});
