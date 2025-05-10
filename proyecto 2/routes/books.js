const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

// display books page
router.get('/', function (req, res, next) {
    dbConn.query('SELECT * FROM books ORDER BY id desc', function (err, rows) {
        if (err) {
            req.flash('error', err);
            // render to views/index.ejs
            res.render('index', { data: '' });
        } else {
            // render to views/index.ejs
            res.render('index', { data: rows });
        }
    });
});

// display add book page
router.get('/add', function (req, res, next) {
    res.render('add', {
        name: '',
        author: ''
    });
});

// add a new book
router.post('/add', function (req, res, next) {
    let name = req.body.name;
    let author = req.body.author;
    let errors = false;

    if (name.length === 0 || author.length === 0) {
        errors = true;
        req.flash('error', "Por favor ingrese el nombre y el autor");
        res.render('add', {
            name: name,
            author: author
        });
    }

    if (!errors) {
        let form_data = { name, author };

        dbConn.query('INSERT INTO books SET ?', form_data, function (err, result) {
            if (err) {
                req.flash('error', err);
                res.render('add', {
                    name: form_data.name,
                    author: form_data.author
                });
            } else {
                req.flash('success', 'Libro agregado exitosamente');
                res.redirect('/');
            }
        });
    }
});

// display edit book page
router.get('/edit/:id', function (req, res, next) {
    let id = req.params.id;

    dbConn.query('SELECT * FROM books WHERE id = ?', [id], function (err, rows) {
        if (err) throw err;

        if (rows.length <= 0) {
            req.flash('error', `Libro no encontrado con id = ${id}`);
            res.redirect('/');
        } else {
            res.render('edit', {
                title: 'Edit Book',
                id: rows[0].id,
                name: rows[0].name,
                author: rows[0].author
            });
        }
    });
});

// update book data
router.post('/update/:id', function (req, res, next) {
    let id = req.params.id;
    let name = req.body.name;
    let author = req.body.author;
    let errors = false;

    if (name.length === 0 || author.length === 0) {
        errors = true;
        req.flash('error', "Por favor ingrese el nombre y el autor");
        res.render('edit', {
            id,
            name,
            author
        });
    }

    if (!errors) {
        let form_data = { name, author };

        dbConn.query('UPDATE books SET ? WHERE id = ?', [form_data, id], function (err, result) {
            if (err) {
                req.flash('error', err);
                res.render('edit', {
                    id,
                    name: form_data.name,
                    author: form_data.author
                });
            } else {
                req.flash('success', 'Libro actualizado exitosamente');
                res.redirect('/');
            }
        });
    }
});

// delete book
router.get('/delete/:id', function (req, res, next) {
    let id = req.params.id;

    dbConn.query('DELETE FROM books WHERE id = ?', [id], function (err, result) {
        if (err) {
            req.flash('error', err);
            res.redirect('/');
        } else {
            req.flash('success', `¡Libro eliminado con éxito! ID = ${id}`);
            res.redirect('/');
        }
    });
});

module.exports = router;
