const express = require('express');
const {Pool} = require('pg');
const app = express();
const cors = require('cors');
const path = require('path');
const PORT = process.env.PORT || 5000;

/* local testing const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '5569',
  database: 'pokemon_db'
}); 
*/

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

// Get all Pokémon
app.get('/api/pokemon', (req, res) => {
  pool.query('SELECT * FROM pokemon ORDER BY pokedex_number', (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

// Search Pokémon
app.get('/api/pokemon/search', (req, res) => {
  const { name, type1, type2, minHp, maxHp, minAttack, maxAttack, minDefense, maxDefense, minSpeed, maxSpeed } = req.query;
  
  let query = 'SELECT * FROM pokemon WHERE 1=1';
  const params = [];
  let paramCount = 1;
  
  if (name) {
    query += ` AND name ILIKE $${paramCount}`;
    params.push(`%${name}%`);
    paramCount++;
  }
  if (type1) {
    query += ` AND type1 ILIKE $${paramCount}`;
    params.push(`%${type1}%`);
    paramCount++;
  }
  if (type2) {
    query += ` AND type2 ILIKE $${paramCount}`;
    params.push(`%${type2}%`);
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
  
  pool.query(query, params, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result.rows);
  });
});

// Get one Pokémon by ID
app.get('/api/pokemon/:id', (req, res) => {
  const id = req.params.id;
  pool.query('SELECT * FROM pokemon WHERE pokedex_number = $1', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.rows.length === 0) return res.status(404).json({ error: 'Pokémon not found' });
    res.json(result.rows[0]);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});