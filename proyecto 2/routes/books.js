const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

// display books page
router.get('/', function (req, res, next) {
  const sql = `
      SELECT
        b.id_book AS id,
        b.name,
        a.name AS author,
        c.name AS category,
        p.name AS publisher,
        b.year_published,
        b.num_pages
      FROM books b
      JOIN authors a ON b.id_author = a.id_author
      JOIN categories c ON b.id_category = c.id_category
      JOIN publishers p ON b.id_publisher = p.id_publisher
      ORDER BY b.id_book DESC
    `;

  dbConn.query(sql, function (err, rows) {
    if (err) {
      req.flash('error', err);
      res.render('books', { data: [] });
    } else {
      res.render('books', { data: rows });
    }
  });
});

// display add book page
router.get('/add', function (req, res, next) {
  // Consultar autores, categorías y editoriales para llenar selects
  const sqlAuthors = 'SELECT id_author, name FROM authors WHERE state = 1 ORDER BY name';
  const sqlCategories = 'SELECT id_category, name FROM categories WHERE state = 1 ORDER BY name';
  const sqlPublishers = 'SELECT id_publisher, name FROM publishers WHERE state = 1 ORDER BY name';

  Promise.all([
    new Promise((resolve, reject) => dbConn.query(sqlAuthors, (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => dbConn.query(sqlCategories, (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => dbConn.query(sqlPublishers, (err, results) => err ? reject(err) : resolve(results)))
  ]).then(([authors, categories, publishers]) => {
    res.render('books/add', {
      name: '',
      id_author: '',
      id_category: '',
      id_publisher: '',
      isbn: '',
      year_published: '',
      num_pages: '',
      authors,
      categories,
      publishers,
      messages: req.flash()
    });
  }).catch(err => {
    req.flash('error', 'Error al cargar datos: ' + err.message);
    res.render('books/add', { authors: [], categories: [], publishers: [], messages: req.flash() });
  });
});

// add a new book
router.post('/add', function (req, res, next) {
  let { name, id_author, id_category, id_publisher, isbn, year_published, num_pages } = req.body;

  let errors = false;

  if (!name || !id_author || !id_category || !id_publisher) {
    errors = true;
    req.flash('error', "Por favor completa todos los campos obligatorios.");
  }

  if (errors) {
    // Recargar selects para renderizar el formulario con datos previos
    const sqlAuthors = 'SELECT id_author, name FROM authors WHERE state = 1 ORDER BY name';
    const sqlCategories = 'SELECT id_category, name FROM categories WHERE state = 1 ORDER BY name';
    const sqlPublishers = 'SELECT id_publisher, name FROM publishers WHERE state = 1 ORDER BY name';

    Promise.all([
      new Promise((resolve, reject) => dbConn.query(sqlAuthors, (err, results) => err ? reject(err) : resolve(results))),
      new Promise((resolve, reject) => dbConn.query(sqlCategories, (err, results) => err ? reject(err) : resolve(results))),
      new Promise((resolve, reject) => dbConn.query(sqlPublishers, (err, results) => err ? reject(err) : resolve(results)))
    ]).then(([authors, categories, publishers]) => {
      res.render('books/add', {
        name,
        id_author,
        id_category,
        id_publisher,
        isbn,
        year_published,
        num_pages,
        authors,
        categories,
        publishers,
        messages: req.flash()
      });
    }).catch(err => {
      req.flash('error', 'Error al cargar datos: ' + err.message);
      res.render('books/add', { authors: [], categories: [], publishers: [], messages: req.flash() });
    });
    return;
  }

  // Insertar datos en la tabla books
  const form_data = {
    name,
    id_author,
    id_category,
    id_publisher,
    isbn: isbn || null,
    year_published: year_published || null,
    num_pages: num_pages || null
  };

  dbConn.query('INSERT INTO books SET ?', form_data, function (err, result) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('books/add');
    } else {
      req.flash('success', 'Libro agregado exitosamente');
      res.redirect('/books');
    }
  });
});

// display edit book page
router.get('/edit/:id', function (req, res, next) {
  let id = req.params.id;

  // Consulta para obtener el libro
  dbConn.query('SELECT * FROM books WHERE id_book = ?', [id], function (err, books) {
    if (err) return next(err);

    if (books.length <= 0) {
      req.flash('error', `Libro no encontrado con id = ${id}`);
      return res.redirect('/books');
    }

    let book = books[0];

    // Consultar autores, categorías y editoriales activas para los selects
    dbConn.query('SELECT * FROM authors WHERE state = 1', function (err, authors) {
      if (err) return next(err);

      dbConn.query('SELECT * FROM categories WHERE state = 1', function (err, categories) {
        if (err) return next(err);

        dbConn.query('SELECT * FROM publishers WHERE state = 1', function (err, publishers) {
          if (err) return next(err);

          res.render('books/edit', {
            title: 'Editar Libro',
            book,           // Pasamos todo el objeto libro para acceder a sus campos en la vista
            authors,
            categories,
            publishers,
            messages: req.flash()
          });
        });
      });
    });
  });
});

// update book data
router.post('/update/:id', function (req, res, next) {
  let id = req.params.id;

  // Recibir datos del formulario
  let { name, id_author, id_category, id_publisher, isbn, year_published, num_pages } = req.body;
  let errors = false;

  // Validar campos obligatorios
  if (!name || !id_author || !id_category || !id_publisher) {
    errors = true;
    req.flash('error', "Por favor ingrese título, autor, categoría y editorial.");
  }

  if (errors) {
    // En caso de error, recargar listas para selects y mostrar el formulario con datos ingresados
    dbConn.query('SELECT * FROM authors WHERE state = 1', function (err, authors) {
      if (err) return next(err);

      dbConn.query('SELECT * FROM categories WHERE state = 1', function (err, categories) {
        if (err) return next(err);

        dbConn.query('SELECT * FROM publishers WHERE state = 1', function (err, publishers) {
          if (err) return next(err);

          res.render('books/edit', {
            title: 'Editar Libro',
            book: {
              id_book: id,
              name,
              id_author,
              id_category,
              id_publisher,
              isbn,
              year_published,
              num_pages
            },
            authors,
            categories,
            publishers,
            messages: req.flash()
          });
        });
      });
    });
    return;
  }

  // Preparar datos para actualizar
  let form_data = {
    name,
    id_author,
    id_category,
    id_publisher,
    isbn: isbn || null,
    year_published: year_published || null,
    num_pages: num_pages || null
  };

  // Ejecutar update
  dbConn.query('UPDATE books SET ? WHERE id_book = ?', [form_data, id], function (err, result) {
    if (err) {
      req.flash('error', err.message);
      // Volver a cargar listas y mostrar formulario con datos
      dbConn.query('SELECT * FROM authors WHERE state = 1', function (err, authors) {
        if (err) return next(err);

        dbConn.query('SELECT * FROM categories WHERE state = 1', function (err, categories) {
          if (err) return next(err);

          dbConn.query('SELECT * FROM publishers WHERE state = 1', function (err, publishers) {
            if (err) return next(err);

            res.render('books/edit', {
              title: 'Editar Libro',
              book: { id_book: id, ...form_data },
              authors,
              categories,
              publishers,
              messages: req.flash()
            });
          });
        });
      });
    } else {
      req.flash('success', 'Libro actualizado exitosamente');
      res.redirect('/books');
    }
  });
});

// delete book
router.get('/delete/:id', function (req, res, next) {
  let id = req.params.id;
  console.log('Eliminar libro con id:', id);

  dbConn.query('DELETE FROM books WHERE id_book = ?', [id], function (err, result) {
    if (err) {
      console.log('Error al eliminar libro:', err);
      req.flash('error', err.message || err);
      res.redirect('/books');
    } else {
      console.log('Resultado de eliminación:', result);
      req.flash('success', `¡Libro eliminado con éxito! ID = ${id}`);
      res.redirect('/books');
    }
  });
});

module.exports = router;