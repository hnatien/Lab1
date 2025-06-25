// routes/greetings.js
const express = require('express');
const router = express.Router();
const { readData, writeData } = require('../utils/dataUtils');

// GET all greetings
router.get('/', (req, res) => {
  try {
    const greetings = readData();
    res.json({
      success: true,
      count: greetings.length,
      data: greetings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greetings' });
  }
});

// GET all greetings with optional filtering
router.get('/', (req, res) => {
  try {
    let greetings = readData();

    // Filter by language if specified
    if (req.query.language) {
      greetings = greetings.filter(g =>
        g.language.toLowerCase().includes(req.query.language.toLowerCase())
      );
    }

    // Filter by formal if specified
    if (req.query.formal !== undefined) {
      const formal = req.query.formal === 'true';
      greetings = greetings.filter(g => g.formal === formal);
    }

    res.json({
      success: true,
      count: greetings.length,
      data: greetings
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greetings' });
  }
});


// GET greeting by ID
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const greetings = readData();
    const greeting = greetings.find(g => g.id === id);

    if (!greeting) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    res.json({
      success: true,
      data: greeting
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve greeting' });
  }
});

// POST new greeting
router.post('/', (req, res) => {
  try {
    const greetings = readData();
    const { language, greeting, formal } = req.body;

    // Validate request
    if (!language || !greeting) {
      return res.status(400).json({ error: 'Language and greeting are required fields' });
    }

    // Check if language already exists
    const existingGreeting = greetings.find(g => g.language.toLowerCase() === language.toLowerCase());
    if (existingGreeting) {
      return res.status(409).json({ error: 'Greeting for this language already exists' });
    }

    // Generate new ID
    const newId = greetings.length > 0 ? Math.max(...greetings.map(g => g.id)) + 1 : 1;

    // New greeting object
    const newGreeting = {
      id: newId,
      language: language.trim(),
      greeting: greeting.trim(),
      formal: typeof formal === 'undefined' ? true : Boolean(formal)
    };

    // Add to data and save
    greetings.push(newGreeting);
    const success = writeData(greetings);

    if (success) {
      res.status(201).json({ message: 'Greeting created successfully', data: newGreeting });
    } else {
      res.status(500).json({ error: 'Failed to create greeting' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create greeting' });
  }
});

// PUT update greeting
router.put('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { language, greeting, formal } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const greetings = readData();
    const index = greetings.findIndex(g => g.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    // Check if language already exists (excluding current greeting)
    const existingGreeting = greetings.find(g => g.language.toLowerCase() === language.toLowerCase() && g.id !== id);
    if (existingGreeting) {
      return res.status(409).json({ error: 'Greeting for this language already exists' });
    }

    // Update greeting
    greetings[index] = {
      id,
      language: language.trim(),
      greeting: greeting.trim(),
      formal: typeof formal === 'undefined' ? Boolean(greetings[index].formal) : Boolean(formal)
    };

    const success = writeData(greetings);
    if (success) {
      res.json({ message: 'Greeting updated successfully', data: greetings[index] });
    } else {
      res.status(500).json({ error: 'Failed to update greeting' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update greeting' });
  }
});

// DELETE greeting
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const greetings = readData();
    const index = greetings.findIndex(g => g.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Greeting not found' });
    }

    const deletedGreeting = greetings.splice(index, 1)[0];
    const success = writeData(greetings);

    if (success) {
      res.json({
        success: true,
        message: 'Greeting deleted successfully',
        data: deletedGreeting
      });
    } else {
      res.status(500).json({ error: 'Failed to delete greeting' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete greeting' });
  }
});

module.exports = router;
