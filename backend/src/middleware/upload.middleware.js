const multer = require('multer');
const path = require('path');
const fs = require('fs');

const productImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/product-images/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const userImagesStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/user-images/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const imagesFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) return cb(null, true);

    cb(new Error('Only image files are allowed!'));
}

const uploadProductImages = multer({
    storage: productImagesStorage,
    fileFilter: imagesFilter,
    limits: {
        files: 5,
        fileSize: 2 * 1024 * 1024 // 2MB upload limit 
    }
});

const uploadUserImage = multer({
    storage: userImagesStorage,
    fileFilter: imagesFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});

async function deleteFile(filePath) {
    await new Promise((resolve) => {
        fs.unlink(filePath, (err) => {
            if (err && err.code !== "ENOENT") console.error(`Failed to delete file: ${filePath}`, err);
            resolve();
        });
    });
}

module.exports.uploadProductImages = uploadProductImages;
module.exports.uploadUserImage = uploadUserImage;
module.exports.deleteFile = deleteFile;