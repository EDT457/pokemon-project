const express = require('express');
const { Pool } = require('pg');
const app = express();
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'doosan';

const pool = new Pool({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

// Test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working' });
});

// Search Pokémon with filters and pagination
app.get('/api/pokemon/search', (req, res) => {
    const { name, type1, type2, minHp, maxHp, minAttack, maxAttack, minDefense, maxDefense, minSpeed, maxSpeed, limit, offset } = req.query;

    let query = 'SELECT * FROM pokemon WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (name) {
        query += ` AND name ILIKE $${paramCount}`;
        params.push(`%${name.trim()}%`);
        paramCount++;
    }
    if (type1) {
        query += ` AND (type1 ILIKE $${paramCount} OR type2 ILIKE $${paramCount})`;
        params.push(`%${type1.trim()}%`);
        paramCount++;
    }
    if (type2) {
        query += ` AND type2 ILIKE $${paramCount}`;
        params.push(`%${type2.trim()}%`);
        paramCount++;
    }
    if (minHp) {
        query += ` AND hp >= $${paramCount}`;
        params.push(parseInt(minHp));
        paramCount++;
    }
    if (maxHp) {
        query += ` AND hp <= $${paramCount}`;
        params.push(parseInt(maxHp));
        paramCount++;
    }
    if (minAttack) {
        query += ` AND attack >= $${paramCount}`;
        params.push(parseInt(minAttack));
        paramCount++;
    }
    if (maxAttack) {
        query += ` AND attack <= $${paramCount}`;
        params.push(parseInt(maxAttack));
        paramCount++;
    }
    if (minDefense) {
        query += ` AND defense >= $${paramCount}`;
        params.push(parseInt(minDefense));
        paramCount++;
    }
    if (maxDefense) {
        query += ` AND defense <= $${paramCount}`;
        params.push(parseInt(maxDefense));
        paramCount++;
    }
    if (minSpeed) {
        query += ` AND speed >= $${paramCount}`;
        params.push(parseInt(minSpeed));
        paramCount++;
    }
    if (maxSpeed) {
        query += ` AND speed <= $${paramCount}`;
        params.push(parseInt(maxSpeed));
        paramCount++;
    }

    query += ' ORDER BY pokedex_number';

    // First, get total count
    pool.query(`SELECT COUNT(*) FROM (${query}) AS count_query`, params, (err, countResult) => {
        if (err) return res.status(500).json({ error: err.message });

        const totalCount = parseInt(countResult.rows[0].count);

        // Then get paginated results
        const paginationQuery = query + ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        const paginationParams = [...params, parseInt(limit) || 20, parseInt(offset) || 0];

        pool.query(paginationQuery, paginationParams, (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ pokemon: result.rows, count: totalCount });
        });
    });
});

// Get all pokemon with pagination
app.get('/api/pokemon', (req, res) => {
    const { limit, offset } = req.query;
    const pageLimit = parseInt(limit) || 20;
    const pageOffset = parseInt(offset) || 0;

    pool.query(
        'SELECT COUNT(*) FROM pokemon',
        (err, countResult) => {
            if (err) return res.status(500).json({ error: err.message });

            const totalCount = parseInt(countResult.rows[0].count);

            pool.query(
                'SELECT * FROM pokemon ORDER BY pokedex_number LIMIT $1 OFFSET $2',
                [pageLimit, pageOffset],
                (err, result) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ pokemon: result.rows, count: totalCount });
                }
            );
        }
    );
});

// Get one Pokemon by ID
app.get('/api/pokemon/:id', (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM pokemon WHERE pokedex_number = $1', [id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.rows.length === 0) return res.status(404).json({ error: 'Pokémon not found' });
        res.json(result.rows[0]);
    });
});

// User registration endpoint
app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password required' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    pool.query(
        'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, hashedPassword],
        (err, result) => {
            if (err) {
                if (err.code === '23505') {  // Unique constraint violation
                    return res.status(400).json({ error: 'Username or email already exists' });
                }
                return res.status(500).json({ error: err.message });
            }

            const user = result.rows[0];
            const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);

            res.json({
                message: 'User registered successfully',
                token,
                user
            });
        }
    );
});

// User login endpoint
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    pool.query(
        'SELECT id, username, email, password FROM users WHERE username = $1',
        [username],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const user = result.rows[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET);

            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});