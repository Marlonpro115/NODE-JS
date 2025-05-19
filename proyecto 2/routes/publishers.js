const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

// Mostrar página de editoriales
router.get('/', function (req, res, next) {
    const sql = `
    SELECT
      id_publisher AS id,
      name,
      state
    FROM publishers
    ORDER BY id_publisher DESC
  `;

    dbConn.query(sql, function (err, rows) {
        if (err) {
            req.flash('error', err);
            res.render('publishers', { data: [] });
        } else {
            res.render('publishers', { data: rows });
        }
    });
});

// Mostrar página para agregar editorial
router.get('/add', function (req, res, next) {
    res.render('publishers/add', {
        name: '',
        state: 1,
        messages: req.flash()
    });
});

// Agregar nueva editorial
router.post('/add', function (req, res, next) {
    const { name, state } = req.body;
    let errors = false;

    if (!name) {
        errors = true;
        req.flash('error', "Por favor completa el nombre de la editorial.");
    }

    if (errors) {
        res.render('publishers/add', {
            name,
            state,
            messages: req.flash()
        });
        return;
    }

    const form_data = {
        name,
        state: state === '1' ? 1 : 0
    };

    dbConn.query('INSERT INTO publishers SET ?', form_data, function (err, result) {
        if (err) {
            req.flash('error', 'Error al agregar editorial: ' + err.message);
            res.redirect('publishers/add');
        } else {
            req.flash('success', 'Editorial agregada exitosamente');
            res.redirect('/publishers');
        }
    });
});

// Mostrar página para editar editorial
router.get('/edit/:id', function (req, res, next) {
    const id = req.params.id;

    dbConn.query('SELECT * FROM publishers WHERE id_publisher = ?', [id], function (err, publishers) {
        if (err) return next(err);

        if (publishers.length <= 0) {
            req.flash('error', `Editorial no encontrada con id = ${id}`);
            return res.redirect('/publishers');
        }

        const publisher = publishers[0];

        res.render('publishers/edit', {
            title: 'Editar Editorial',
            publisher,
            messages: req.flash()
        });
    });
});

// Actualizar datos de la editorial
router.post('/update/:id', function (req, res, next) {
    const id = req.params.id;
    const { name, state } = req.body;
    let errors = false;

    if (!name) {
        errors = true;
        req.flash('error', "Por favor ingresa el nombre de la editorial.");
    }

    if (errors) {
        return res.render('publishers/edit', {
            title: 'Editar Editorial',
            publisher: {
                id_publisher: id,
                name,
                state
            },
            messages: req.flash()
        });
    }

    const form_data = {
        name,
        state: state === '1' ? 1 : 0
    };

    dbConn.query('UPDATE publishers SET ? WHERE id_publisher = ?', [form_data, id], function (err, result) {
        if (err) {
            req.flash('error', 'Error al actualizar: ' + err.message);
            return res.render('publishers/edit', {
                title: 'Editar Editorial',
                publisher: {
                    id_publisher: id,
                    ...form_data
                },
                messages: req.flash()
            });
        } else {
            req.flash('success', 'Editorial actualizada exitosamente');
            res.redirect('/publishers');
        }
    });
});

// Eliminar editorial
router.get('/delete/:id', function (req, res, next) {
    const id = req.params.id;
    console.log('Eliminar editorial con id:', id);

    dbConn.query('DELETE FROM publishers WHERE id_publisher = ?', [id], function (err, result) {
        if (err) {
            console.log('Error al eliminar editorial:', err);
            req.flash('error', err.message || err);
            res.redirect('/publishers');
        } else {
            console.log('Resultado de eliminación:', result);
            req.flash('success', `¡Editorial eliminada con éxito! ID = ${id}`);
            res.redirect('/publishers');
        }
    });
});

module.exports = router;