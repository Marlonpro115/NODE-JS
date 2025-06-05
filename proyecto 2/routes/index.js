const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

router.get('/', async (req, res, next) => {
    res.render('index', {
        titleWeb: 'Inicio'
    });
});

module.exports = router;