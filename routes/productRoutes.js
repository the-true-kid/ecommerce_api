const express = require('express');
const router = express.Router();
const { getProductById, getProductsByCategory, getAllProducts } = require('../queries/productQueries');

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Retrieve a list of products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category to filter products by
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   product_id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 */
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

/**
 * @swagger
 * /api/products/{productId}:
 *   get:
 *     summary: Retrieve a single product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: A single product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 product_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *       404:
 *         description: Product not found
 *       500:
 *         description: Failed to retrieve product
 */
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