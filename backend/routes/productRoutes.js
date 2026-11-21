const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add a New Product
router.post('/', async (req, res) => {
  try {
    const { name, sku, category, purchasePrice, sellingPrice, gstRate, stock } = req.body;
    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        purchasePrice: parseFloat(purchasePrice),
        sellingPrice: parseFloat(sellingPrice),
        gstRate: gstRate ? parseFloat(gstRate) : 18.0,
        stock: parseInt(stock) || 0
      }
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;