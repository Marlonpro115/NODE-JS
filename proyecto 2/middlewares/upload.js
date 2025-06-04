const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Configuración del almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/covers');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const randomName = crypto.randomBytes(16).toString('hex');
        cb(null, randomName + ext);
    }
});

// Filtro para solo aceptar imágenes
const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

module.exports = multer({ storage, fileFilter });