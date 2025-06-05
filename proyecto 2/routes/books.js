const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');
const upload = require('../middlewares/upload');
const fs = require('fs');
const path = require('path');

// display books page with pagination
router.get('/', function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  const dataQuery = `
    SELECT
      b.id_book AS id,
      b.name,
      b.cover_image,
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
    LIMIT ? OFFSET ?
  `;

  const countQuery = `SELECT COUNT(*) AS total FROM books`;

  dbConn.query(countQuery, function (err, countResult) {
    if (err) {
      req.flash('error', err);
      return res.render('dashboard/books', { data: [], currentPage: 1, totalPages: 1, messages: req.flash() });
    }

    const totalBooks = countResult[0].total;
    const totalPages = Math.ceil(totalBooks / limit);

    dbConn.query(dataQuery, [limit, offset], function (err, rows) {
      if (err) {
        req.flash('error', err);
        return res.render('dashboard/books', { data: [], currentPage: 1, totalPages: 1, messages: req.flash() });
      }

      res.render('dashboard/books', {
        data: rows,
        currentPage: page,
        totalPages,
        messages: req.flash()
      });
    });
  });
});

// display add book page
router.get('/add', upload.single('cover_image'), function (req, res, next) {
  // Consultar autores, categorías y editoriales para llenar selects
  const sqlAuthors = 'SELECT id_author, name FROM authors WHERE state = 1 ORDER BY name';
  const sqlCategories = 'SELECT id_category, name FROM categories WHERE state = 1 ORDER BY name';
  const sqlPublishers = 'SELECT id_publisher, name FROM publishers WHERE state = 1 ORDER BY name';

  Promise.all([
    new Promise((resolve, reject) => dbConn.query(sqlAuthors, (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => dbConn.query(sqlCategories, (err, results) => err ? reject(err) : resolve(results))),
    new Promise((resolve, reject) => dbConn.query(sqlPublishers, (err, results) => err ? reject(err) : resolve(results)))
  ]).then(([authors, categories, publishers]) => {
    res.render('dashboard/books/add', {
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
    res.render('dashboard/books/add', { authors: [], categories: [], publishers: [], messages: req.flash() });
  });
});

// add a new book
router.post('/add', upload.single('cover_image'), function (req, res, next) {
  let { name, id_author, id_category, id_publisher, isbn, year_published, num_pages } = req.body;

  let errors = false;

  if (!name || !id_author || !id_category || !id_publisher) {
    errors = true;
    req.flash('error', "Por favor completa todos los campos obligatorios.");
  }

  let coverImage = null;
  if (req.file) {
    coverImage = req.file.filename;
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
      res.render('dashboard/books/add', {
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
      res.render('dashboard/books/add', { authors: [], categories: [], publishers: [], messages: req.flash() });
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
    num_pages: num_pages || null,
    cover_image: coverImage
  };

  dbConn.query('INSERT INTO books SET ?', form_data, function (err, result) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('/dashboard/books/add');
    } else {
      req.flash('success', 'Libro agregado exitosamente');
      res.redirect('/dashboard/books');
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
      return res.redirect('/dashboard/books');
    }

    let book = books[0];

    // Consultar autores, categorías y editoriales activas para los selects
    dbConn.query('SELECT * FROM authors WHERE state = 1', function (err, authors) {
      if (err) return next(err);

      dbConn.query('SELECT * FROM categories WHERE state = 1', function (err, categories) {
        if (err) return next(err);

        dbConn.query('SELECT * FROM publishers WHERE state = 1', function (err, publishers) {
          if (err) return next(err);

          res.render('dashboard/books/edit', {
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
router.post('/update/:id', upload.single('cover_image'), function (req, res, next) {
  const id = req.params.id;

  // Recibir datos del formulario
  const {
    name,
    id_author,
    id_category,
    id_publisher,
    isbn,
    year_published,
    num_pages,
    current_cover_image
  } = req.body;

  let errors = false;

  // Validar campos obligatorios
  if (!name || !id_author || !id_category || !id_publisher) {
    errors = true;
    req.flash('error', "Por favor ingrese título, autor, categoría y editorial.");
  }

  // Obtener nombre del nuevo archivo si se cargó
  const cover_image = req.file ? req.file.filename : null;

  if (errors) {
    // En caso de error, recargar listas para selects y mostrar el formulario con datos ingresados
    dbConn.query('SELECT * FROM authors WHERE state = 1', function (err, authors) {
      if (err) return next(err);

      dbConn.query('SELECT * FROM categories WHERE state = 1', function (err, categories) {
        if (err) return next(err);

        dbConn.query('SELECT * FROM publishers WHERE state = 1', function (err, publishers) {
          if (err) return next(err);

          res.render('dashboard/books/edit', {
            title: 'Editar Libro',
            book: {
              id_book: id,
              name,
              id_author,
              id_category,
              id_publisher,
              isbn,
              year_published,
              num_pages,
              cover_image: cover_image || current_cover_image
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

  if (cover_image) {
    form_data.cover_image = cover_image;
  }

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

            res.render('dashboard/books/edit', {
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
      // Eliminar portada anterior si se cargó una nueva
      if (cover_image && current_cover_image) {
        const imagePath = path.join(__dirname, '../public/uploads/covers/', current_cover_image);
        fs.unlink(imagePath, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen anterior:', err.message);
          }
        });
      }

      req.flash('success', 'Libro actualizado exitosamente');
      res.redirect('/dashboard/books');
    }
  });
});


// delete book
router.get('/delete/:id', function (req, res, next) {
  let id = req.params.id;

  // Paso 1: Obtener el nombre de la portada actual
  dbConn.query('SELECT cover_image FROM books WHERE id_book = ?', [id], function (err, rows) {
    if (err) {
      console.log('Error al obtener portada del libro:', err);
      req.flash('error', 'Error al intentar eliminar el libro.');
      return res.redirect('/dashboard/books');
    }

    if (rows.length === 0) {
      req.flash('error', `Libro no encontrado con ID = ${id}`);
      return res.redirect('/dashboard/books');
    }

    const coverImage = rows[0].cover_image;

    // Paso 2: Eliminar el libro de la base de datos+
    dbConn.query('DELETE FROM books WHERE id_book = ?', [id], function (err, result) {
      if (err) {
        console.log('Error al eliminar libro:', err);
        req.flash('error', err.message || err);
        return res.redirect('/dashboard/books');
      }

      // Paso 3: Si el libro tenía portada, eliminar el archivo
      if (coverImage) {
        const imagePath = path.join(__dirname, '../public/uploads/covers/', coverImage);

        fs.unlink(imagePath, function (err) {
          if (err && err.code !== 'ENOENT') {
            console.log('Error al eliminar imagen de portada:', err);
          }
        });
      }

      req.flash('success', `¡Libro eliminado con éxito! ID = ${id}`);
      res.redirect('/dashboard/books');
    });
  });
});

module.exports = router;