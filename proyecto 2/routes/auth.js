const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const connection = require('../lib/db');

// Mostrar formulario login
router.get('/', (req, res) => {
    res.render('login/login', { error: null });
});

// Procesar login
router.post('/', (req, res) => {
    const { email, password } = req.body;

    connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) {
            return res.render('login/login', { error: 'Error en el servidor' });
        }
        if (results.length === 0) {
            return res.render('login/login', { error: 'Usuario no encontrado' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.render('login/login', { error: 'Contraseña incorrecta' });
        }

        req.session.user = {
            id: user.id_user,
            name: user.first_name,
            role: user.role,
            email: user.email
        };

        res.redirect('dashboard');
    });
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;