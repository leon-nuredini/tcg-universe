const express = require('express');
const userRoutes = require('../routes/user.routes');
const productRoutes = require('../routes/product.routes');
const reviewRoutes = require('../routes/review.routes');
const authRoutes = require('../routes/auth.routes');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/users', userRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/authenticate', authRoutes);

    app.use(express.static('public'));
}