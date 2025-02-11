const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const methodOverride = require("method-override");
const path = require('path');

require("dotenv").config({ path: "./config/.env" });

const Book = require('./backend/Book');
const app = express();
const PORT = process.env.PORT || 5500;

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public'))); // Make sure this is before your route definitions

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error(err));



// app.get('/updateBooks', async (req, res) => {
//     try {
//         res.sendFile(path.join(__dirname, 'public', 'updateBooks.html')); 
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

app.get('/', async (req, res) => {
    try {
        res.sendFile('public/index.html'); 
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a task
app.post('/books', async (req, res) => {
    const { title, author, ia, available } = req.body;
    const newBook = new Book({ title, author, ia, available });
    console.log(newBook)
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
app.put('/books/:ia', async (req, res) => {
    const { available } = req.body;
    try {
        const book = await Book.findOneAndUpdate({ ia: req.params.ia }, {available}, { new: true });
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a task
app.delete('/books/:ia', async (req, res) => {
    try {
        await Book.findOneAndDelete(req.params.ia);
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});