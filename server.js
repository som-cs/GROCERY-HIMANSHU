const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;

const secretKey = '0aa5c3eef6b5f0a26fbb2d2f909ba936fcc7557dcf8cc7f4fbd9230070294e26';
// Middleware
app.use(express.json());
app.use(session({
    secret: 'aB3$1sV@n8y2*D4zK!oP6^wQ%r5&T9xE', // Replace with a secure, unique secret in production
    resave: false,
    saveUninitialized: true
}));

// Serve static files from 'public' directory
app.use(express.static('public'));

// Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Henry@5991', // It's risky to have passwords hard-coded
    database: 'grocery_shop'
});
//db.connect((err) => {
//   if (err) {
//        throw err;
//    }
//    console.log('Connected to the MySQL database');
//});

// Middleware to check if the user is authenticated
function checkAuthenticated(req, res, next) {
    // Get the token from the request headers
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    try {
        // Verify the token with the secret key
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send('Unauthorized');
    }
}

// Middleware to check the user's role
function checkRole(role) {
    return (req, res, next) => {
        if (req.user && req.user.userRole === role) {
            next();
        } else {
            console.log("Access Denied. User Role:", req.user?.userRole, "Required Role:", role);
            res.status(403).send('Access Denied');
        }
    };
}



app.post('/add-product', checkAuthenticated, checkRole('admin'), (req, res) => {
    console.log("Request Body:", req.body);
    console.log("Request Headers:", req.headers);

    const newProduct = req.body;
    const sql = 'INSERT INTO products SET ?';
    db.query(sql, newProduct, (err, result) => {
        if (err) {
            console.error("Error in SQL Query:", err);
            return res.status(500).send('Error adding product');
        }
        res.send('Product added successfully');
    });
});

// Read All Products
app.get('/products', (req, res) => {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, results) => {
        if (err) {
            res.status(500).send('Error fetching products');
        } else {
            res.json(results);
        }
    });
});

// Read a Single Product by ID
app.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) {
            res.status(500).send('Error fetching product');
        } else {
            if (result.length === 0) {
                res.status(404).send('Product not found');
            } else {
                res.json(result[0]);
            }
        }
    });
});

// Update a Product
app.put('/product/:id', checkAuthenticated, checkRole('admin'), (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;
    const sql = 'UPDATE products SET ? WHERE id = ?';
    db.query(sql, [updatedProduct, productId], (err, result) => {
        if (err) {
            res.status(500).send('Error updating product');
        } else {
            res.send('Product updated successfully');
        }
    });
});

// Delete a Product
app.delete('/product/:id', checkAuthenticated, checkRole('admin'), (req, res) => {
    const productId = req.params.id;
    const sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) {
            res.status(500).send('Error deleting product');
        } else {
            res.send('Product deleted successfully');
        }
    });
});

// Add a new user
app.post('/add-user', (req, res) => {
    let newUser = req.body;
    let sql = 'INSERT INTO users SET ?';
    db.query(sql, newUser, (err, result) => {
        if (err) throw err;
        res.send('User added successfully');
    });
});

// Fetch all users
app.get('/users', (req, res) => {
    let sql = 'SELECT * FROM users';
    db.query(sql, (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

// Fetch a single user by ID
app.get('/user/:id', (req, res) => {
    let sql = `SELECT * FROM users WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Update a user
app.put('/user/:id', (req, res) => {
    let updatedUser = req.body;
    let sql = `UPDATE users SET username = '${updatedUser.username}', password = '${updatedUser.password}', role = '${updatedUser.role}' WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send('User updated successfully');
    });
});

// Delete a user
app.delete('/user/:id', (req, res) => {
    let sql = `DELETE FROM users WHERE id = ${req.params.id}`;
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.send('User deleted successfully');
    });
});


// User Registration with Hashed Password
app.post('/add-user', async (req, res) => {
    try {
        const { username, password, email } = req.body; // Include all fields received

        // Add validation here (e.g., check if username is already taken)

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword, email }; // Include all fields

        // Insert newUser into the database
        const sql = 'INSERT INTO users SET ?';
        db.query(sql, newUser, (err, result) => {
            if (err) {
                // Handle error (e.g., username already exists)
                return res.status(500).send('Error registering user');
            }
            res.json({ message: 'User registered successfully' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});


//login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});
// User Login
app.post('/login', (req, res) => {
    //const sql = 'SELECT * FROM users WHERE username = ?';
    //db.query(sql, [req.body.username], async (err, results) => {
    //    if (err) throw err;
    //    if (results.length > 0) {
            //const comparison = await bcrypt.compare(req.body.password, results[0].password);
            if (1) {
                const payload = {
                    userId: 1,
                    userRole: "admin" // Ensure this is being correctly retrieved from the database
                };

                const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
                res.json({ message: 'Logged in successfully', token });
            } else {
                res.json({ message: 'Incorrect username or password' });
            }
});



// Logout
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/');
        }
        res.clearCookie('connect.sid');
        res.redirect('/login'); // Assuming you have a route or static file for login
    });
});

// Admin Dashboard Access Control
function isAdmin(req, res, next) {
    
   const token = req.headers.cookie.split('; ')[1].split('=')[1]; // Get the token from the Authorization header
    console.log('-----------------------------')
    console.log(req.headers.cookie.split('; ')[1].split('=')[1])
    if (!token) {
        return res.status(401).send('Unauthorized: Invalid Token - ' + token);
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        if (decoded.userRole === 'admin') {
           next(); 
        } else {
            res.status(403).send('Access Denied');
        }
    } catch (error) {
        // Print the token in case of an invalid token
        console.log(error)
        res.status(401).send('Unauthorized: Invalid Token - ' + token);
    }
}




app.get('/admin-dashboard', isAdmin, (req, res) => {
    
    res.sendFile(path.join(__dirname, 'public/admin-dashboard.html'));
});
app.get('/customer-dashboard', (req, res) => {
    // You might want to add authentication checks here
    res.sendFile(__dirname + '/public/customer-dashboard.html');
});

// Welcome Page Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
