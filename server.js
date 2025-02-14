const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const methodOverride = require("method-override");
const path = require('path');
const passport = require("passport");
const router = express.Router();
const { ensureAuth, ensureGuest } = require("./middleware/auth");
const authController = require("./backend/controllers/auth");
const Book = require('./backend/Book');
const app = express();
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const session = require("express-session");
require("dotenv").config({ path: "./config/.env" });
const PORT = process.env.PORT || 5500;
require("./config/passport")(passport);

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public'))); // Make sure this is before your route definitions

// Initialize session and flash middleware
app.use(session({
    secret: "your_secret_key", // Use an environment variable in production
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error(err));


app.post('/books', async (req, res) => {
    const { title, author, ia, available } = req.body;
    const user = req.user.id
    const newBook = new Book({ title, author, ia, available, user });
    console.log(newBook)
    try {
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/books', async (req, res) => {
    try {
        const books = await Book.find({ user: req.user.id });
        res.json(books);
        console.log("user", req.user)
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    
});

app.put('/books/:ia', async (req, res) => {
    const { available } = req.body;
    try {
        const book = await Book.findOneAndUpdate({ ia: req.params.ia }, { available }, { new: true });
        res.json(book);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/books/:ia', async (req, res) => {
    try {
        await Book.findOneAndDelete({ ia: req.params.ia });
        res.json({ message: 'Book deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/', (req, res) => {
    if (req.user) {
        // User is signed in
        res.send(`Welcome ${req.user.email}`); // Or any other user information
    } else {
        // User is not signed in
        res.redirect('/login'); // Redirect to login page
    }
});

router.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
    console.log("user", req)

});

router.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/isAuthenticated', (req, res) => {
    res.json({ authenticated: req.isAuthenticated() });
    console.log("user", req.isAuthenticated())
});

router.post("/login", authController.postLogin);
router.get("/logout", authController.logout);
router.post("/signup", authController.postSignup);
app.use('/', router);

