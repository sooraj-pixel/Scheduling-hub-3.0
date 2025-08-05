// inventoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryControllers = require('./inventoryControllers'); // Adjust path if needed

// GET all items of a specific type
router.get('/:type', inventoryControllers.getAllItems);

// POST a new item
router.post('/:type', inventoryControllers.addItem);

// PUT (update) item quantity
router.put('/:type/:id/quantity', inventoryControllers.adjustItemQuantity);

// DELETE an item
router.delete('/:type/:id', inventoryControllers.deleteItem);

module.exports = router;
