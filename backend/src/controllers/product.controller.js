const mongoose = require('mongoose');
const { Product } = require('../models/product.model');
const productValidators = require('../validators/product.validators');
const _ = require('lodash');
const { productLogger } = require('../middleware/logger.middleware');
const { deleteImage } = require('../utils/file.utils');
const { handleImageUpdate } = require('../utils/product.utils');

exports.getProducts = async (req, res) => {
    const page = _.clamp(parseInt(req.query.page), 1, Number.MAX_SAFE_INTEGER);
    const limit = _.clamp(parseInt(req.query.limit), 1, Number.MAX_SAFE_INTEGER);
    const docsToSkip = (page - 1) * limit;

    const { brand, category, rating, condition} = req.query;
    const filter = {};
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (rating) filter.rating = rating;
    if (condition) filter.condition = condition;

    try {
        const products = await Product.find(filter).sort({ createdAt: -1 }).skip(docsToSkip).limit(limit).lean();
        const totalProducts = await Product.countDocuments();
        const totalPages = Math.ceil(totalProducts / limit)
        res.json({ page, limit, totalPages, totalProducts, products });
    } catch (error) {
        productLogger.error(`Error fetching all products: ${error.message}`);
    }
}

exports.getProductById = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' });
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        productLogger.error(`Error fetching the product: ${error.message}`);
    }
}

exports.createProduct = async (req, res) => {
    let imagePath = req.file ? req.file.path : null;
    req.body.image = imagePath;
    const { error } = productValidators.validateProduct(req.body);
    if (error) {
        await deleteImage(imagePath);
        return res.status(400).json({ error: error.details[0].message });
    }

    try {
        const product = new Product(req.body);
        const result = await product.save();
        res.status(201).json(result);
    } catch (error) {
        productLogger.error(`Error creating the product: ${error.message}`);
        res.status(500).json({ error: `Error creating the product: ${error.message}` });
    }
}

exports.patchProduct = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' });
    let imagePath = req.file ? req.file.path : null;
    if (imagePath) req.body.image = imagePath;
    const allowedUpdates = ['name', 'image', 'description', 'brand', 'category', 'price', 'quantity', 'rating', 'reviewCount', 'condition'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(field => allowedUpdates.includes(field));
    if (!isValidOperation) {
        await deleteImage(imagePath);
        return res.status(400).json({ error: 'Invalid updates!' });   
    }

    const { error } = productValidators.validateProductForPatching(req.body);
    if (error) {
        await deleteImage(imagePath);
        return res.status(400).json({ error: error.details[0].message });
    }

    let product = await Product.findById(req.params.id);
    if (!product) {
        await deleteImage(imagePath);
        return res.status(404).json({ error: 'Product not found' });
    }

    imagePath = await handleImageUpdate(imagePath, product.image);
    updates.forEach(field => { product[field] = req.body[field] });
    if (imagePath) product.image = imagePath;
    product.updatedAt = new Date();
    try {
        await product.save();
        res.json(product);
    } catch (error) {
        productLogger.error(`Error patching product: ${error.message}`);
        return res.status(500).json({ error: `Error patching product: ${error.message}` });
    }
}

exports.deleteProduct = async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid product ID' });
    try {
        const result = await Product.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ error: 'Product not found' });
        await deleteImage(result.image);
        res.json(result);
    } catch (error) {
        productLogger.error(`Error deleting the product: ${error.message}`);
        res.json({ error: `Error deleting the product: ${error.message}` });
    }
}