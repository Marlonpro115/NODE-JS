const express = require('express');
const router = express.Router();
const dbConn = require('../lib/db');

router.get('/', function (req, res) {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const offset = (page - 1) * limit;

  // Crear condición de búsqueda si existe search
  const searchCondition = search ? `WHERE b.name LIKE ?` : '';
  const searchParams = search ? [`%${search}%`] : [];

  // Obtener totales primero
  const queries = {
    authors: 'SELECT COUNT(*) AS total FROM authors WHERE state = 1',
    categories: 'SELECT COUNT(*) AS total FROM categories WHERE state = 1',
    publishers: 'SELECT COUNT(*) AS total FROM publishers WHERE state = 1',
    books: 'SELECT COUNT(*) AS total FROM books WHERE state = 1',
  };

  Promise.all([
    new Promise((resolve, reject) => dbConn.query(queries.authors, (err, result) => err ? reject(err) : resolve(result[0].total))),
    new Promise((resolve, reject) => dbConn.query(queries.categories, (err, result) => err ? reject(err) : resolve(result[0].total))),
    new Promise((resolve, reject) => dbConn.query(queries.publishers, (err, result) => err ? reject(err) : resolve(result[0].total))),
    new Promise((resolve, reject) => dbConn.query(queries.books, (err, result) => err ? reject(err) : resolve(result[0].total))),
    new Promise((resolve, reject) => {
      const countQuery = `
        SELECT COUNT(*) AS total 
        FROM books b 
        ${searchCondition}
      `;
      dbConn.query(countQuery, searchParams, (err, result) =>
        err ? reject(err) : resolve(result[0].total)
      );
    }),
    new Promise((resolve, reject) => {
      const dataQuery = `
        SELECT 
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
        ${searchCondition}
        ORDER BY b.created_at DESC
        LIMIT ? OFFSET ?
      `;
      dbConn.query(dataQuery, [...searchParams, limit, offset], (err, result) =>
        err ? reject(err) : resolve(result)
      );
    }),
  ])
    .then(([authors, categories, publishers, books, totalBooksFiltered, recentBooks]) => {
      const totalPages = Math.ceil(totalBooksFiltered / limit);

      res.render('dashboard', {
        totals: { authors, categories, publishers, books },
        recentBooks,
        error: null,
        search,
        currentPage: page,
        totalPages,
      });
    })
    .catch((err) => {
      console.error(err);
      res.render('dashboard', {
        totals: {},
        recentBooks: [],
        error: 'Error al cargar datos',
        search,
        currentPage: 1,
        totalPages: 1,
      });
    });
});

module.exports = router;