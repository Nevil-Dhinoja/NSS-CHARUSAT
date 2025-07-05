// const db = require('../db');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// exports.loginUser = (req, res) => {
//     const { login_id, password } = req.body;

//     const sql = `SELECT * FROM roles 
//                  JOIN assigned_users ON roles.id = assigned_users.role_id 
//                  WHERE login_id = ?`;

//     db.query(sql, [login_id], (err, result) => {
//         if (err) return res.status(500).json({ error: err.message });

//         if (result.length === 0) return res.status(401).json({ message: 'User not found' });

//         const user = result[0];

//         bcrypt.compare(password, user.password_hash, (err, isMatch) => {
//             if (password !== user.password_hash) {
//                 return res.status(401).json({ message: 'Invalid password' });
//             }

//             const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
//                 expiresIn: '1d'
//             });
//             res.json({ token, role: user.role, name: user.name });
//         });
//     });
// };


const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = (req, res) => {
    const { login_id, password } = req.body;

    const sql = `SELECT * FROM roles 
                 JOIN assigned_users ON roles.id = assigned_users.role_id 
                 WHERE login_id = ?`;

    db.query(sql, [login_id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0) return res.status(401).json({ success: false, message: 'User not found' });

        const user = result[0];

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error checking password' });

            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Invalid password' });
            }

            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
                expiresIn: '30m'
            });

            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    institute: user.institute,
                    department: user.department
                }
            });
        });
    });
};