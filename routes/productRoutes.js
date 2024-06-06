const express = require('express');
const router = express.Router();
const { getProductById, getProductsByCategory } = require('../queries/productQueries');



router.get('/', async (req, res) => {
    const { category } = req.query;
    if (!category) {
        return res.status(400).json({ error: 'Category ID is required' });
    }

    try {
        const products = await getProductsByCategory(category);
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
