-- Crear base de datos
CREATE DATABASE IF NOT EXISTS db_library;
USE db_library;

-- Tabla de autores
CREATE TABLE IF NOT EXISTS authors (
  id_author INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id_category INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de editoriales
CREATE TABLE IF NOT EXISTS publishers (
  id_publisher INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  state TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de libros
CREATE TABLE IF NOT EXISTS books (
  id_book INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  id_author INT NOT NULL,
  id_category INT NOT NULL,
  id_publisher INT NOT NULL,
  isbn VARCHAR(20),
  year_published YEAR,
  num_pages INT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  state TINYINT(1) DEFAULT 1,
  FOREIGN KEY (id_author) REFERENCES authors(id_author) ON DELETE CASCADE,
  FOREIGN KEY (id_category) REFERENCES categories(id_category) ON DELETE CASCADE,
  FOREIGN KEY (id_publisher) REFERENCES publishers(id_publisher) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos en la tabla de autores
INSERT INTO authors (name, state) VALUES 
('Gabriel García Márquez', 1),
('Isabel Allende', 1);

-- Insertar datos en la tabla de categorías
INSERT INTO categories (name, state) VALUES 
('Ficción', 1),
('Realismo Mágico', 1);

-- Insertar datos en la tabla de editoriales
INSERT INTO publishers (name, state) VALUES 
('Editorial Sudamericana', 1),
('Alfaguara', 1);

-- Insertar datos en la tabla de libros
INSERT INTO books (name, id_author, id_category, id_publisher, isbn, year_published, num_pages, state)
VALUES 
('Cien Años de Soledad', 1, 2, 1, '978-0307474728', 1967, 417, 1),
('La Casa de los Espíritus', 2, 2, 2, '978-0553383805', 1982, 433, 1);
