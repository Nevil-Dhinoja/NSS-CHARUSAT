const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const volunteerRoutes = require('./routes/volunteers');
app.use('/api/volunteers', volunteerRoutes); 

app.use(express.static(path.join(__dirname, '../client')));

app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
