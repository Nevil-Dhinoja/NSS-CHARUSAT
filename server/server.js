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

app.use(express.static(path.join(__dirname, '../client')));

app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
});
const bcrypt = require('bcryptjs');
const password = "test123"; // or whatever you want
bcrypt.hash(password, 10, (err, hash) => {
  console.log("Hash:", hash);
});
