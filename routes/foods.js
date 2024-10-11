const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your DB connection file

// Create the 'foods' table if it doesn't exist
const createFoodsTableQuery = `
    CREATE TABLE IF NOT EXISTS foods (
        id SERIAL PRIMARY KEY,                -- Unique identifier for each food item
        name VARCHAR(255) NOT NULL,           -- Name of the food item
        calories INTEGER NOT NULL,            -- Calories content of the food item
        protein NUMERIC(5, 2) NOT NULL,       -- Protein content (in grams)
        carbs NUMERIC(5, 2) NOT NULL,         -- Carbohydrates content (in grams)
        fats NUMERIC(5, 2) NOT NULL,          -- Fats content (in grams)
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the food item was added
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Timestamp when the food item was last updated
    );
`;

// Create the 'foods' table when the app starts
db.query(createFoodsTableQuery, (err, result) => {
    if (err) {
        console.error("Error creating 'foods' table:", err);
    } else {
        console.log("'foods' table is ready or already exists.");
    }
});

// Route to check if the foods router works
router.get('/', (req, res) => {
    res.send('Foods router is working');
});

// Route to get all foods
router.get('/getfoods', (req, res) => {
    const getfoodsQuery = 'SELECT * FROM foods';

    // Execute the query
    db.query(getfoodsQuery, (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Send the results back to the client
        res.json(results.rows); // Use `.rows` to access result set in pg
    });
});

// Route to add a new food item
router.post('/addfood', (req, res) => {
    const { name, calories, protein, carbs, fats } = req.body; // Extract food details from the request body

    // Check if all required fields are provided
    if (!name || !calories || !protein || !carbs || !fats) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    const addFoodQuery = `
        INSERT INTO foods (name, calories, protein, carbs, fats)
        VALUES ($1, $2, $3, $4, $5) RETURNING id`;

    // Execute the query
    db.query(addFoodQuery, [name, calories, protein, carbs, fats], (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Send a success response with the newly inserted food ID
        res.status(201).json({ message: "Food added successfully", foodId: results.rows[0].id });
    });
});

// Route to delete a food item
router.delete('/deletefood/:id', (req, res) => {
    const foodId = req.params.id; // Get the food ID from the URL parameter

    const deleteFoodQuery = 'DELETE FROM foods WHERE id = $1';

    // Execute the query
    db.query(deleteFoodQuery, [foodId], (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Check if any rows were affected (meaning a food item was deleted)
        if (results.rowCount === 0) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Send a success response
        res.status(200).json({ message: "Food item deleted successfully" });
    });
});

// Route to edit a food item
router.put('/editfood/:id', (req, res) => {
    const foodId = req.params.id; // Get the food ID from the URL parameter
    const { name, calories, protein, carbs, fats } = req.body; // Extract updated food details from the request body

    // Check if any fields are provided for updating
    if (!name && !calories && !protein && !carbs && !fats) {
        return res.status(400).json({ message: "Please provide at least one field to update." });
    }

    // Construct the SQL query dynamically based on the provided fields
    const updateFields = [];
    const values = [];
    
    if (name) {
        updateFields.push('name = $' + (updateFields.length + 1));
        values.push(name);
    }
    if (calories) {
        updateFields.push('calories = $' + (updateFields.length + 1));
        values.push(calories);
    }
    if (protein) {
        updateFields.push('protein = $' + (updateFields.length + 1));
        values.push(protein);
    }
    if (carbs) {
        updateFields.push('carbs = $' + (updateFields.length + 1));
        values.push(carbs);
    }
    if (fats) {
        updateFields.push('fats = $' + (updateFields.length + 1));
        values.push(fats);
    }

    // Add the foodId to the values array
    values.push(foodId);

    // Construct the full SQL query
    const updateQuery = `UPDATE foods SET ${updateFields.join(', ')} WHERE id = $${values.length}`;

    // Execute the query
    db.query(updateQuery, values, (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Check if any rows were affected (meaning a food item was updated)
        if (results.rowCount === 0) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Send a success response
        res.status(200).json({ message: "Food item updated successfully" });
    });
});

module.exports = router;
