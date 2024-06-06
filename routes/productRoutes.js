const express = require('express');
const router = express.Router();
const { getProductById, getProductsByCategory, getAllProducts } = require('../queries/productQueries');  

router.get('/', async (req, res) => {
    const { category } = req.query;
    try {
        let products;
        if (category) {
            products = await getProductsByCategory(category);
        } else {
            products = await getAllProducts();
        }
        res.json(products);
    } catch (err) {
        console.error('Failed to get products', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/:productId', async (req, res) => {
    try {
        const product = await getProductById(req.params.productId);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve product', details: error.message });
    }
});

module.exports = router;