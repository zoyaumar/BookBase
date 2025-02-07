// index.js
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('./Book');

const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));


// Create a task
app.post('/books', async (req, res) => {
    const { title, author, ia } = req.body;
    const newBook = new Book({ title, author, ia });
    try {
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all tasks
app.get('/books', async (req, res) => {
    try {
        const books = await Book.find();
        res.json(books);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a task
app.put('/book/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a task
app.delete('/books/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});