// server/index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

// Connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone_number TEXT NOT NULL UNIQUE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        address_details TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        pin_code TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    )`);
});

// Customer Routes

// POST /api/customers: Create a new customer.
app.post("/api/customers", (req, res) => {
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name || !last_name || !phone_number) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = `INSERT INTO customers (first_name, last_name, phone_number) VALUES (?, ?, ?)`;
    db.run(sql, [first_name, last_name, phone_number], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ error: "Phone number already exists." });
            }
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ message: "Customer created successfully", customerId: this.lastID });
    });
});

// GET /api/customers: Get a list of all customers (should support searching, sorting, and pagination).
app.get("/api/customers", (req, res) => {
    const { search, city, state, pin_code, page = 1, limit = 10, sort_by = "id", order = "ASC" } = req.query;
    let sql = `SELECT * FROM customers`;
    let countSql = `SELECT COUNT(*) as totalCount FROM customers`;
    let params = [];
    let conditions = [];

    if (search) {
        conditions.push(`(first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ?)`);
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (city || state || pin_code) {
        sql = `SELECT c.* FROM customers c JOIN addresses a ON c.id = a.customer_id`;
        countSql = `SELECT COUNT(DISTINCT c.id) as totalCount FROM customers c JOIN addresses a ON c.id = a.customer_id`;
        if (city) {
            conditions.push(`a.city LIKE ?`);
            params.push(`%${city}%`);
        }
        if (state) {
            conditions.push(`a.state LIKE ?`);
            params.push(`%${state}%`);
        }
        if (pin_code) {
            conditions.push(`a.pin_code LIKE ?`);
            params.push(`%${pin_code}%`);
        }
    }

    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(` AND `);
        countSql += ` WHERE ` + conditions.join(` AND `);
    }

    // Get total count first
    db.get(countSql, params, (err, countRow) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        const totalCount = countRow.totalCount;

        sql += ` GROUP BY c.id ORDER BY ${sort_by} ${order} LIMIT ? OFFSET ?`;
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

        db.all(sql, params, (err, rows) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            res.json({ message: "success", data: rows, totalCount: totalCount });
        });
    });
});

// GET /api/customers/:id: Get details for a single customer.
app.get("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM customers WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Customer not found." });
        }
        res.json({ message: "success", data: row });
    });
});

// PUT /api/customers/:id: Update a customer's information.
app.put("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number } = req.body;

    if (!first_name || !last_name || !phone_number) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const sql = `UPDATE customers SET first_name = ?, last_name = ?, phone_number = ? WHERE id = ?`;
    db.run(sql, [first_name, last_name, phone_number, id], function (err) {
        if (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ error: "Phone number already exists." });
            }
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }
        res.json({ message: "Customer updated successfully" });
    });
});

// DELETE /api/customers/:id: Delete a customer.
app.delete("/api/customers/:id", (req, res) => {
    const { id } = req.params;
    const sql = `DELETE FROM customers WHERE id = ?`;
    db.run(sql, [id], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Customer not found." });
        }
        res.json({ message: "Customer deleted successfully" });
    });
});

// Address Routes

// POST /api/customers/:id/addresses: Add a new address for a specific customer.
app.post("/api/customers/:id/addresses", (req, res) => {
    const { id } = req.params;
    const { address_details, city, state, pin_code } = req.body;

    if (!address_details || !city || !state || !pin_code) {
        return res.status(400).json({ error: "All address fields are required." });
    }

    const sql = `INSERT INTO addresses (customer_id, address_details, city, state, pin_code) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [id, address_details, city, state, pin_code], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.status(201).json({ message: "Address added successfully", addressId: this.lastID });
    });
});

// GET /api/customers/:id/addresses: Get all addresses for a specific customer.
app.get("/api/customers/:id/addresses", (req, res) => {
    const { id } = req.params;
    const sql = `SELECT * FROM addresses WHERE customer_id = ?`;
    db.all(sql, [id], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "success", data: rows });
    });
});

// PUT /api/addresses/:addressId: Update a specific address.
app.put("/api/addresses/:addressId", (req, res) => {
    const { addressId } = req.params;
    const { address_details, city, state, pin_code } = req.body;

    if (!address_details || !city || !state || !pin_code) {
        return res.status(400).json({ error: "All address fields are required." });
    }

    const sql = `UPDATE addresses SET address_details = ?, city = ?, state = ?, pin_code = ? WHERE id = ?`;
    db.run(sql, [address_details, city, state, pin_code, addressId], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Address not found." });
        }
        res.json({ message: "Address updated successfully" });
    });
});

// DELETE /api/addresses/:addressId: Delete a specific address.
app.delete("/api/addresses/:addressId", (req, res) => {
    const { addressId } = req.params;
    const sql = `DELETE FROM addresses WHERE id = ?`;
    db.run(sql, [addressId], function (err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Address not found." });
        }
        res.json({ message: "Address deleted successfully" });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});




// Basic Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something broke!");
});


