const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

router.get('/', function (req, res, next) {
    dbConn.query('SELECT id_book, name, cover_image FROM books ORDER BY id_book DESC', function (err, books) {
        if (err) return next(err);
        res.render('index', {
            titleWeb: 'Inicio',
            books: books,
            cssStyle: 'style.css',
        });
    });
});

module.exports = router;