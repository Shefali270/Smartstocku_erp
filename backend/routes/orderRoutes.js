const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get All Orders (With items and product details)
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});          

// 2. Create a New Order / GST Invoice (And deduct stock automatically)
router.post('/', async (req, res) => {
  try {
    const { invoiceNumber, customerName, customerPhone, paymentMode, items } = req.body;
    
    // items format expected: [{ productId: 1, quantity: 2, price: 500 }]
    let subtotal = 0;
    let gstAmount = 0;

    // Calculate totals and verify stock
    for (let item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ error: `Product ID ${item.productId} not found` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }

      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      const gst = (itemTotal * (product.gstRate || 18)) / 100;
      gstAmount += gst;
    }

    const grandTotal = subtotal + gstAmount;

    // Use Prisma Transaction to create order, order items, and update stock
    const result = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          invoiceNumber,
          customerName,
          customerPhone,
          subtotal,
          gstAmount,
          grandTotal,
          paymentMode: paymentMode || 'Cash',
          items: {
            create: items.map(i => ({
              productId: i.productId,
              quantity: i.quantity,
              price: i.price
            }))
          }
        },
        include: { items: true }
      });

      // Update product stocks
      for (let item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      return newOrder;
    });

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;