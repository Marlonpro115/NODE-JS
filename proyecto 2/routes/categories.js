const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

// Mostrar página de categorías con paginación
router.get('/', function (req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) AS total FROM categories`;
    const dataQuery = `
    SELECT 
      id_category AS id,
      name,
      state
    FROM categories
    ORDER BY id_category DESC
    LIMIT ? OFFSET ?
  `;

    dbConn.query(countQuery, function (err, countResult) {
        if (err) {
            req.flash('error', err);
            return res.render('dashboard/categories', { data: [], currentPage: 1, totalPages: 1, messages: req.flash() });
        }

        const totalCategories = countResult[0].total;
        const totalPages = Math.ceil(totalCategories / limit);

        dbConn.query(dataQuery, [limit, offset], function (err, rows) {
            if (err) {
                req.flash('error', err);
                return res.render('dashboard/categories', { data: [], currentPage: 1, totalPages: 1, messages: req.flash() });
            }

            res.render('dashboard/categories', {
                data: rows,
                currentPage: page,
                totalPages,
                messages: req.flash()
            });
        });
    });
});

// Mostrar página para agregar categoría
router.get('/add', function (req, res, next) {
    res.render('dashboard/categories/add', {
        name: '',
        state: 1,
        messages: req.flash()
    });
});

// Agregar nueva categoría
router.post('/add', function (req, res, next) {
    const { name, state } = req.body;
    let errors = false;

    if (!name) {
        errors = true;
        req.flash('error', "Por favor completa el nombre de la categoría.");
    }

    if (errors) {
        res.render('dashboard/categories/add', {
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

    dbConn.query('INSERT INTO categories SET ?', form_data, function (err, result) {
        if (err) {
            req.flash('error', 'Error al agregar categoría: ' + err.message);
            res.redirect('/dashboard/categories/add');
        } else {
            req.flash('success', 'Categoría agregada exitosamente');
            res.redirect('/dashboard/categories');
        }
    });
});

// Mostrar página para editar categoría
router.get('/edit/:id', function (req, res, next) {
    const id = req.params.id;

    dbConn.query('SELECT * FROM categories WHERE id_category = ?', [id], function (err, categories) {
        if (err) return next(err);

        if (categories.length <= 0) {
            req.flash('error', `Categoría no encontrada con id = ${id}`);
            return res.redirect('/dashboard/categories');
        }

        const category = categories[0];

        res.render('dashboard/categories/edit', {
            title: 'Editar Categoría',
            category,
            messages: req.flash()
        });
    });
});

// Actualizar datos de la categoría
router.post('/update/:id', function (req, res, next) {
    const id = req.params.id;
    const { name, state } = req.body;
    let errors = false;

    if (!name) {
        errors = true;
        req.flash('error', "Por favor ingresa el nombre de la categoría.");
    }

    if (errors) {
        return res.render('dashboard/categories/edit', {
            title: 'Editar Categoría',
            category: {
                id_category: id,
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

    dbConn.query('UPDATE categories SET ? WHERE id_category = ?', [form_data, id], function (err, result) {
        if (err) {
            req.flash('error', 'Error al actualizar: ' + err.message);
            return res.render('dashboard/categories/edit', {
                title: 'Editar Categoría',
                category: {
                    id_category: id,
                    ...form_data
                },
                messages: req.flash()
            });
        } else {
            req.flash('success', 'Categoría actualizada exitosamente');
            res.redirect('/dashboard/categories');
        }
    });
});

// Eliminar categoría
router.get('/delete/:id', function (req, res, next) {
    const id = req.params.id;
    console.log('Eliminar categoría con id:', id);

    dbConn.query('DELETE FROM categories WHERE id_category = ?', [id], function (err, result) {
        if (err) {
            console.log('Error al eliminar categoría:', err);
            req.flash('error', err.message || err);
            res.redirect('/dashboard/categories');
        } else {
            console.log('Resultado de eliminación:', result);
            req.flash('success', `¡Categoría eliminada con éxito! ID = ${id}`);
            res.redirect('/dashboard/categories');
        }
    });
});

module.exports = router;