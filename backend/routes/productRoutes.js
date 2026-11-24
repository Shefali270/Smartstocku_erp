const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get All Products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add a New Product (with image)
router.post('/', async (req, res) => {
  try {
    const {
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      price,
      gstRate,
      stock,
      image,
    } = req.body;

    const finalSellingPrice =
      sellingPrice !== undefined && sellingPrice !== ''
        ? parseFloat(sellingPrice)
        : price !== undefined && price !== ''
        ? parseFloat(price)
        : 0;

    const finalPurchasePrice =
      purchasePrice !== undefined && purchasePrice !== ''
        ? parseFloat(purchasePrice)
        : finalSellingPrice;

    const newProduct = await prisma.product.create({
      data: {
        name: String(name || '').trim(),
        sku: String(sku || `SKU-${Date.now()}`).trim(),
        category: String(category || 'Electronics').trim(),
        purchasePrice: Number.isNaN(finalPurchasePrice) ? 0 : finalPurchasePrice,
        sellingPrice: Number.isNaN(finalSellingPrice) ? 0 : finalSellingPrice,
        gstRate: gstRate !== undefined && gstRate !== '' ? parseFloat(gstRate) : 18.0,
        stock: parseInt(stock, 10) || 0,
        image: typeof image === 'string' ? image : '',
      },
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 3. Update an Existing Product (including image)
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const {
      name,
      sku,
      category,
      purchasePrice,
      sellingPrice,
      price,
      gstRate,
      stock,
      image,
    } = req.body;

    const nextSelling =
      sellingPrice !== undefined && sellingPrice !== ''
        ? parseFloat(sellingPrice)
        : price !== undefined && price !== ''
        ? parseFloat(price)
        : existing.sellingPrice;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name).trim() : existing.name,
        sku: sku !== undefined ? String(sku).trim() : existing.sku,
        category: category !== undefined ? String(category).trim() : existing.category,
        purchasePrice:
          purchasePrice !== undefined && purchasePrice !== ''
            ? parseFloat(purchasePrice)
            : existing.purchasePrice,
        sellingPrice: Number.isNaN(nextSelling) ? existing.sellingPrice : nextSelling,
        gstRate:
          gstRate !== undefined && gstRate !== ''
            ? parseFloat(gstRate)
            : existing.gstRate,
        stock: stock !== undefined && stock !== '' ? parseInt(stock, 10) : existing.stock,
        image: typeof image === 'string' ? image : existing.image,
      },
    });

    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 4. Delete a Product
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;