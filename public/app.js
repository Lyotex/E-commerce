const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');

const app = express();
const port = 3000;

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Your MySQL password
    database: 'product_cart'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));

// Routes
app.get('/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.sendFile(__dirname + '/views/product.html');
    });
});

app.post('/add-to-cart', (req, res) => {
    const productId = req.body.productId;
    const quantity = req.body.quantity;

    if (!req.session.cart) {
        req.session.cart = {};
    }

    if (!req.session.cart[productId]) {
        req.session.cart[productId] = 0;
    }

    req.session.cart[productId] += parseInt(quantity);
    res.redirect('/cart');
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || {};
    res.sendFile(__dirname + '/views/cart.html');
});

app.post('/remove-from-cart', (req, res) => {
    const productId = req.body.productId;
    delete req.session.cart[productId];
    res.redirect('/cart');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});