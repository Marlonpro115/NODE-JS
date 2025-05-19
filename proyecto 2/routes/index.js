const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

router.get('/', function (req, res, next) {
  // Contar autores
  dbConn.query('SELECT COUNT(*) AS total FROM authors WHERE state = 1', (err, authorsCount) => {
    if (err) {
      console.error(err);
      return res.render('index', { totals: {}, recentBooks: [], error: 'Error al cargar datos' });
    }

    // Contar categorías
    dbConn.query('SELECT COUNT(*) AS total FROM categories WHERE state = 1', (err, categoriesCount) => {
      if (err) {
        console.error(err);
        return res.render('index', { totals: {}, recentBooks: [], error: 'Error al cargar datos' });
      }

      // Contar editoriales
      dbConn.query('SELECT COUNT(*) AS total FROM publishers WHERE state = 1', (err, publishersCount) => {
        if (err) {
          console.error(err);
          return res.render('index', { totals: {}, recentBooks: [], error: 'Error al cargar datos' });
        }

        // Contar libros
        dbConn.query('SELECT COUNT(*) AS total FROM books WHERE state = 1', (err, booksCount) => {
          if (err) {
            console.error(err);
            return res.render('index', { totals: {}, recentBooks: [], error: 'Error al cargar datos' });
          }

          // Obtener libros recientes
          dbConn.query(
            `SELECT 
              b.name AS book_name,
              a.name AS author_name,
              c.name AS category_name,
              p.name AS publisher_name,
              b.year_published,
              b.state
            FROM books b
            JOIN authors a ON b.id_author = a.id_author
            JOIN categories c ON b.id_category = c.id_category
            JOIN publishers p ON b.id_publisher = p.id_publisher
            ORDER BY b.created_at DESC
            LIMIT 10`,
            (err, recentBooks) => {
              if (err) {
                console.error(err);
                return res.render('index', { totals: {}, recentBooks: [], error: 'Error al cargar datos' });
              }

              // Renderizar con todos los totales incluidos
              res.render('index', {
                totals: {
                  authors: authorsCount[0].total,
                  categories: categoriesCount[0].total,
                  publishers: publishersCount[0].total,
                  books: booksCount[0].total,
                },
                recentBooks,
                error: null,
              });
            }
          );
        });
      });
    });
  });
});

module.exports = router;