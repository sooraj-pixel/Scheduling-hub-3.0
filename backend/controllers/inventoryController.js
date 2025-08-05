// inventoryControllers.js
const mysql = require('mysql2/promise');

let dbPool; // This will hold the database connection pool

// Function to initialize the pool (call this from your main server file)
const initializeDbPool = (pool) => {
    dbPool = pool;
};

// Helper function to get table name based on item type
const getTableName = (type) => {
    if (type === 'stationery') {
        return 'stationery_items';
    } else if (type === 'merchandise') {
        return 'merchandise_items';
    }
    throw new Error('Invalid item type provided.');
};

// Controller to get all items of a specific type
const getAllItems = async (req, res) => {
    const { type } = req.params;
    try {
        const tableName = getTableName(type);
        const [rows] = await dbPool.query(`SELECT * FROM ${tableName} ORDER BY name ASC`);
        res.json(rows);
    } catch (error) {
        console.error(`Error fetching ${type} items:`, error);
        res.status(500).json({ message: `Error fetching ${type} items`, error: error.message });
    }
};

// Controller to add a new item
const addItem = async (req, res) => {
    const { type } = req.params;
    const { name, quantity, reorder_level, price } = req.body;

    try {
        const tableName = getTableName(type);
        let query;
        let values;

        if (type === 'stationery') {
            if (!name || quantity === undefined || reorder_level === undefined) {
                return res.status(400).json({ message: 'Missing required fields for stationery item (name, quantity, reorder_level).' });
            }
            query = `INSERT INTO ${tableName} (name, quantity, reorder_level) VALUES (?, ?, ?)`;
            values = [name, quantity, reorder_level];
        } else if (type === 'merchandise') {
            if (!name || quantity === undefined || price === undefined) {
                return res.status(400).json({ message: 'Missing required fields for merchandise item (name, quantity, price).' });
            }
            query = `INSERT INTO ${tableName} (name, quantity, price) VALUES (?, ?, ?)`;
            values = [name, quantity, price];
        } else {
            return res.status(400).json({ message: 'Invalid item type.' });
        }

        const [result] = await dbPool.execute(query, values);

        res.status(201).json({
            id: result.insertId,
            name,
            quantity,
            ...(type === 'stationery' && { reorder_level }),
            ...(type === 'merchandise' && { price }),
        });
    } catch (error) {
        console.error(`Error adding ${type} item:`, error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: `Item with name '${name}' already exists.`, error: error.message });
        }
        res.status(500).json({ message: `Error adding ${type} item`, error: error.message });
    }
};

// Controller to adjust item quantity
const adjustItemQuantity = async (req, res) => {
    const { type, id } = req.params;
    const { delta } = req.body;

    if (delta === undefined || (delta !== 1 && delta !== -1)) {
        return res.status(400).json({ message: 'Invalid delta value. Must be 1 or -1.' });
    }

    try {
        const tableName = getTableName(type);
        const query = `UPDATE ${tableName} SET quantity = GREATEST(0, quantity + ?) WHERE id = ?`;
        const [result] = await dbPool.execute(query, [delta, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        const [updatedItem] = await dbPool.query(`SELECT * FROM ${tableName} WHERE id = ?`, [id]);
        if (updatedItem.length > 0) {
            res.status(200).json({ message: 'Quantity updated successfully', item: updatedItem[0] });
        } else {
            res.status(200).json({ message: 'Quantity updated, but item not found for re-fetch.' });
        }
    } catch (error) {
        console.error(`Error adjusting ${type} quantity:`, error);
        res.status(500).json({ message: `Error adjusting ${type} quantity`, error: error.message });
    }
};

// Controller to delete an item
const deleteItem = async (req, res) => {
    const { type, id } = req.params;

    try {
        const tableName = getTableName(type);
        const query = `DELETE FROM ${tableName} WHERE id = ?`;
        const [result] = await dbPool.execute(query, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found.' });
        }

        res.status(200).json({ message: 'Item deleted successfully.' });
    } catch (error) {
        console.error(`Error deleting ${type} item:`, error);
        res.status(500).json({ message: `Error deleting ${type} item`, error: error.message });
    }
};

module.exports = {
    initializeDbPool,
    getAllItems,
    addItem,
    adjustItemQuantity,
    deleteItem,
};
