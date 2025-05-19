const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

// Mostrar página de autores
router.get('/', function (req, res, next) {
  const sql = `
    SELECT 
      id_author AS id,
      name,
      state
    FROM authors
    ORDER BY id_author DESC
  `;

  dbConn.query(sql, function (err, rows) {
    if (err) {
      req.flash('error', err);
      res.render('authors', { data: [] });
    } else {
      res.render('authors', { data: rows });
    }
  });
});

// display add book page
// Mostrar página para agregar autor
router.get('/add', function (req, res, next) {
  res.render('authors/add', {
    name: '',
    state: 1,
    messages: req.flash()
  });
});

// add a new book
// Agregar nuevo autor
router.post('/add', function (req, res, next) {
  const { name, state } = req.body;
  let errors = false;

  if (!name) {
    errors = true;
    req.flash('error', "Por favor completa el nombre del autor.");
  }

  if (errors) {
    res.render('authors/add', {
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

  dbConn.query('INSERT INTO authors SET ?', form_data, function (err, result) {
    if (err) {
      req.flash('error', 'Error al agregar autor: ' + err.message);
      res.redirect('authors/add');
    } else {
      req.flash('success', 'Autor agregado exitosamente');
      res.redirect('/authors');
    }
  });
});

// Mostrar página para editar autor
router.get('/edit/:id', function (req, res, next) {
  const id = req.params.id;

  dbConn.query('SELECT * FROM authors WHERE id_author = ?', [id], function (err, authors) {
    if (err) return next(err);

    if (authors.length <= 0) {
      req.flash('error', `Autor no encontrado con id = ${id}`);
      return res.redirect('/authors');
    }

    const author = authors[0];

    res.render('authors/edit', {
      title: 'Editar Autor',
      author,
      messages: req.flash()
    });
  });
});

// Actualizar datos del autor
router.post('/update/:id', function (req, res, next) {
  const id = req.params.id;
  const { name, state } = req.body;
  let errors = false;

  if (!name) {
    errors = true;
    req.flash('error', "Por favor ingresa el nombre del autor.");
  }

  if (errors) {
    return res.render('authors/edit', {
      title: 'Editar Autor',
      author: {
        id_author: id,
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

  dbConn.query('UPDATE authors SET ? WHERE id_author = ?', [form_data, id], function (err, result) {
    if (err) {
      req.flash('error', 'Error al actualizar: ' + err.message);
      return res.render('authors/edit', {
        title: 'Editar Autor',
        author: {
          id_author: id,
          ...form_data
        },
        messages: req.flash()
      });
    } else {
      req.flash('success', 'Autor actualizado exitosamente');
      res.redirect('/authors');
    }
  });
});

// Eliminar autor
router.get('/delete/:id', function (req, res, next) {
  const id = req.params.id;
  console.log('Eliminar autor con id:', id);

  dbConn.query('DELETE FROM authors WHERE id_author = ?', [id], function (err, result) {
    if (err) {
      console.log('Error al eliminar autor:', err);
      req.flash('error', err.message || err);
      res.redirect('/authors');
    } else {
      console.log('Resultado de eliminación:', result);
      req.flash('success', `¡Autor eliminado con éxito! ID = ${id}`);
      res.redirect('/authors');
    }
  });
});

module.exports = router;