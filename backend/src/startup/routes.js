const express = require('express');
const productRoutes = require('../routes/product.routes');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/products', productRoutes);
}