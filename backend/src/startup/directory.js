const fs = require('fs');

module.exports = function () {
    if (!fs.existsSync(`./public/uploads`)) fs.mkdirSync('./public/uploads');
    if (!fs.existsSync('./public/uploads/product-images')) fs.mkdirSync('./public/uploads/product-images');
}