const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const flash = require('express-flash');
const session = require('express-session');
const mysql = require('mysql');
const connection = require('./lib/db');

const booksRouter = require('./routes/books');
const authorsRouter = require('./routes/authors');
const categoriesRouter = require('./routes/categories');
const publishersRouter = require('./routes/publishers');
const dashboardRouter = require('./routes/dashboard');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');

const app = express();
const PORT = 5000;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  cookie: { maxAge: 60000 },
  store: new session.MemoryStore,
  saveUninitialized: true,
  resave: 'true',
  secret: 'secret'
}))

app.use(flash());

app.use('/dashboard', dashboardRouter);
app.use('/dashboard/books', booksRouter);
app.use('/dashboard/authors', authorsRouter);
app.use('/dashboard/categories', categoriesRouter);
app.use('/dashboard/publishers', publishersRouter);
app.use('/', indexRouter);
app.use('/login', authRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

module.exports = app;