const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); // Import express-session
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2'); // or require('mysql')

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up session middleware
app.use(session({
    secret: 'your_secret_key', // Change this to a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: process.env.user,
    password: process.env.password,
    database: process.env.database // replace with your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error occurred while connecting: ' + err.stack);
        return;
    }
    console.log('Connected status ' + connection.threadId);
});

// Route to serve index.html
app.get('/', (req, res) => {
    // Render the index.html and pass the username if it exists
    res.sendFile(path.join(__dirname, 'public', 'index.html'), {
        headers: {
            'username': req.session.username || '' // Pass username as a header
        }
    });
});

// Register route
app.post('/register', (req, res) => {
    console.log(req.body); // Log the request body to see what is being sent
    const { name, mobile, email, password } = req.body;

    // Insert user into the database
    const query = 'INSERT INTO users (name, mobile, email, password) VALUES (?, ?, ?, ?)';
    connection.query(query, [name, mobile, email, password], (err, results) => {
        if (err) {
            console.error('Error inserting user:', err);
            return res.status(500).send('Error registering user');
        }
        res.redirect('/login.html'); // Redirect to login page after registration
    });
});

// Login users
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Query to find the user by email and password
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    connection.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying user:', err);
            return res.status(500).send('Error logging in');
        }

        // Check if user exists
        if (results.length > 0) {
            // User found, login successful
            req.session.username = results[0].name; // Store username in session
            req.session.userId = results[0].id; // Store user ID in session
            res.redirect('/'); // Redirect to profile page
        } else {
            // User not found, login failed
            res.status(401).send('Invalid email or password');
        }
    });
});

// Profile route
app.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login.html'); // Redirect to login if not logged in
    }

    console.log('User  ID from session:', req.session.userId);
    // Fetch user details from the database
    const query = 'SELECT * FROM users WHERE id = ?';
    connection.query(query, [req.session.userId], (err, results) => {
        if (err) {
            console.error('Error fetching user details:', err);
            
            return res.status(500).send('Error fetching user details');
        }

        if (results.length > 0) {
            const user = results[0];
            // Render profile page with user details
            res.send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>User Profile</title>
                    <link rel="stylesheet" href="/styles.css"> 
                </head>
                <body>
                    <h1>Welcome, ${user.name}</h1>
                    <p>Email: ${user.email}</p>
                    <p>Mobile: ${user.mobile}</p>
                    <a href="/logout">Logout</a>
                </body>
                </html>
            `);
        } else {
            res.status(404).send('User  not found');
        }
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        }
        res.redirect('/login.html'); // Redirect to login page after logout
    });
});

// Fetch products (no fetch() call needed here, it's a direct route)
app.get('/api/products', (req, res) => {
    connection.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.json(results);  // Send products as JSON response
    });
});

// Add item to cart
app.post('/api/cart', (req, res) => {
    const { productId, quantity } = req.body;
    connection.query(
        'INSERT INTO cart (product_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [productId, quantity],
        (err, results) => {
            if (err) throw err;
            res.send('Item added to cart');
        }
    );
});

// Fetch cart items
app.get('/api/cart', (req, res) => {
    connection.query(
        'SELECT cart.id, products.title, products.price, cart.quantity FROM cart INNER JOIN products ON cart.product_id = products.id',
        (err, results) => {
            if (err) throw err;
            res.json(results);  // Send cart items as JSON response
        }
    );
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Error starting server:', err);
});
