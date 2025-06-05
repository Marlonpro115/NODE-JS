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

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  middle_name VARCHAR(50),
  last_name VARCHAR(50) NOT NULL,
  second_last_name VARCHAR(50),
  username VARCHAR(50) UNIQUE,
  document_type ENUM('CC', 'TI', 'CE', 'NIT', 'PAS') NOT NULL,
  document_number VARCHAR(20) NOT NULL UNIQUE,
  birth_date DATE NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  cover_image VARCHAR(255),
  description TEXT,
  total_quantity INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  state TINYINT(1) DEFAULT 1,
  FOREIGN KEY (id_author) REFERENCES authors(id_author) ON DELETE CASCADE,
  FOREIGN KEY (id_category) REFERENCES categories(id_category) ON DELETE CASCADE,
  FOREIGN KEY (id_publisher) REFERENCES publishers(id_publisher) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de préstamos
CREATE TABLE IF NOT EXISTS book_loans (
  id_loan INT AUTO_INCREMENT PRIMARY KEY,
  id_book INT NOT NULL,
  id_user INT,
  loan_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  return_date DATETIME,
  returned TINYINT(1) DEFAULT 0,
  FOREIGN KEY (id_book) REFERENCES books(id_book) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de ventas
CREATE TABLE IF NOT EXISTS book_sales (
  id_sale INT AUTO_INCREMENT PRIMARY KEY,
  id_book INT NOT NULL,
  id_user INT,
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  quantity INT DEFAULT 1,
  FOREIGN KEY (id_book) REFERENCES books(id_book) ON DELETE CASCADE,
  FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos en la tabla de autores
INSERT INTO authors (name, state) VALUES 
('Gabriel García Márquez', 1),
('Isabel Allende', 1),
('Mario Vargas Llosa', 1),
('Julio Cortázar', 1),
('Laura Esquivel', 1),
('Carlos Fuentes', 1),
('Jorge Luis Borges', 1);

-- Insertar datos en la tabla de categorías
INSERT INTO categories (name, state) VALUES 
('Ficción', 1),
('Realismo Mágico', 1),
('Novela Histórica', 1),
('Ensayo', 1),
('Poesía', 1),
('Literatura Fantástica', 1),
('Ciencia Ficción', 1);

-- Insertar datos en la tabla de editoriales
INSERT INTO publishers (name, state) VALUES 
('Editorial Sudamericana', 1),
('Alfaguara', 1),
('Planeta', 1),
('Seix Barral', 1),
('Fondo de Cultura Económica', 1),
('Anagrama', 1),
('Minotauro', 1);

INSERT INTO users (
  first_name, middle_name, last_name, second_last_name,
  username, document_type, document_number,
  birth_date, email, password, role, created_at
) VALUES (
  'Marlon', 'Agusto', 'Perez', 'Hernandez',
  'Marlonpro115', 'CC', '1104257462',
  '2004-12-16', 'marlonperezhe@gmail.com', '23124477', 'admin', CURRENT_TIMESTAMP
);