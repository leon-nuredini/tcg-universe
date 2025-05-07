const fs = require('fs');

module.exports = function () {
    if (!fs.existsSync(`./uploads`)) fs.mkdirSync('./uploads');
    if (!fs.existsSync('./uploads/product-images')) fs.mkdirSync('./uploads/product-images');
}