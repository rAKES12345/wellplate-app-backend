const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

// Route to check if the foods router works
router.get('/', (req, res) => {
    res.send('foods router is working');
});

// Route to get all foods
router.get('/getfoods', (req, res) => {
    const getfoods = 'SELECT * FROM foods';

    // Execute the query
    db.query(getfoods, (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Send the results back to the client
        res.json(results);
    });
});

// Route to add a new food item
router.post('/addfood', (req, res) => {
    const { name, calories, protein, carbs, fats } = req.body; // Extract food details from the request body

    // Check if all required fields are provided
    if (!name || !calories || !protein || !carbs || !fats) {
        return res.status(400).json({ message: "Please provide all required fields." });
    }

    const addfood = 'INSERT INTO foods (name, calories, protein, carbs, fats) VALUES (?, ?, ?, ?, ?)';

    // Execute the query
    db.query(addfood, [name, calories, protein, carbs, fats], (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Send a success response
        res.status(201).json({ message: "Food added successfully", foodId: results.insertId });
    });
});

// Route to delete a food item
router.delete('/deletefood/:id', (req, res) => {
    const foodId = req.params.id; // Get the food ID from the URL parameter

    const deletefood = 'DELETE FROM foods WHERE id = ?';

    // Execute the query
    db.query(deletefood, [foodId], (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Check if any rows were affected (meaning a food item was deleted)
        if (results.affectedRows === 0) {
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
        updateFields.push('name = ?');
        values.push(name);
    }
    if (calories) {
        updateFields.push('calories = ?');
        values.push(calories);
    }
    if (protein) {
        updateFields.push('protein = ?');
        values.push(protein);
    }
    if (carbs) {
        updateFields.push('carbs = ?');
        values.push(carbs);
    }
    if (fats) {
        updateFields.push('fats = ?');
        values.push(fats);
    }

    // Add the foodId to the values array
    values.push(foodId);

    // Construct the full SQL query
    const updateQuery = `UPDATE foods SET ${updateFields.join(', ')} WHERE id = ?`;

    // Execute the query
    db.query(updateQuery, values, (err, results) => {
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).json({ message: "Server error" });
        }

        // Check if any rows were affected (meaning a food item was updated)
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: "Food item not found" });
        }

        // Send a success response
        res.status(200).json({ message: "Food item updated successfully" });
    });
});

module.exports = router;
