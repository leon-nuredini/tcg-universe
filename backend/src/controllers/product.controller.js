const { Product } = require('../models/product.model');
const productValidators = require('../validators/product.validators');
const _ = require('lodash');
const { productLogger } = require('../middleware/logger.middleware');
const { deleteImage } = require('../utils/file.utils');
const { handleImageUpdate } = require('../utils/product.utils');

exports.getProducts = async (req, res, next) => {
    req.logger = productLogger;

    const page = _.clamp(parseInt(req.query.page), 1, Number.MAX_SAFE_INTEGER);
    const limit = _.clamp(parseInt(req.query.limit), 1, Number.MAX_SAFE_INTEGER);
    const docsToSkip = (page - 1) * limit;

    const { seller, name, brand, category, condition, minPrice, maxPrice, minRating, maxRating } = req.query;
    const filter = {};
    if (seller) filter.seller = seller;
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (brand) filter.brand = brand;
    if (category) filter.category = category;
    if (condition) filter.condition = condition;

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minRating || maxRating) {
        filter.rating = filter.rating || {};
        if (minRating) filter.rating.$gte = parseFloat(minRating);
        if (maxRating) filter.rating.$lte = parseFloat(maxRating);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(docsToSkip).limit(limit).lean();
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    res.json({ page, limit, totalPages, totalProducts, products });
}

exports.getProductById = async (req, res, next) => {
    req.logger = productLogger;
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
}

exports.createProduct = async (req, res, next) => {
    req.logger = productLogger;
    let imagePath = req.file ? req.file.path : null;
    if (imagePath) imagePath = imagePath.replace('public\\', '');
    req.body.image = imagePath;
    const { error } = productValidators.validateProduct(req.body);
    if (error) {
        await deleteImage(imagePath);
        return res.status(400).json({ error: error.details[0].message });
    }

    const product = new Product(req.body);
    const result = await product.save();
    res.status(201).json(result);
}

exports.patchProduct = async (req, res, next) => {
    req.logger = productLogger;
    let imagePath = req.file ? req.file.path : null;
    if (imagePath) {
        imagePath = imagePath.replace('public\\', '');
        req.body.image = imagePath;
    }
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

    await product.save();
    res.json(product);
}

exports.deleteProduct = async (req, res, next) => {
    req.logger = productLogger;
    const result = await Product.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Product not found' });
    await deleteImage(result.image);
    res.json(result);
}