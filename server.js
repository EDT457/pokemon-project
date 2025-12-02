const express = require('express');
const app = express();
const PORT = 5000;
const cors = require('cors');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('pokemon.db');

const path = require('path');
app.use(express.static(path.join(__dirname, 'frontend')));

// Middleware
app.use(express.json());
app.use(cors()); // You'll need: npm install cors

// Simple route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// get all
app.get('/api/pokemon', (req, res) => {
    db.all('SELECT * FROM pokemon ORDER BY pokedex_number', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows)
    })
})



app.get('/api/pokemon/search', (req, res) => {
  const { name, type1, type2, minHp, maxHp, minAttack, maxAttack, minDefense, maxDefense, minSpeed, maxSpeed } = req.query;
  
  let query = 'SELECT * FROM pokemon WHERE 1=1';
  const params = [];
  
  if (name) {
    query += ' AND name LIKE ?';
    params.push(`%${name}%`);
  }
  if (type1) {
    query += ' AND type1 LIKE ?';
    params.push(`%${type1}%`);
  }
  if (type2) {
    query += ' AND type2 LIKE ?';
    params.push(`%${type2}%`);
  }
  if (minHp) {
    query += ' AND hp >= ?';
    params.push(parseInt(minHp));
  }
  if (maxHp) {
    query += ' AND hp <= ?';
    params.push(parseInt(maxHp));
  }
  if (minAttack) {
    query += ' AND attack >= ?';
    params.push(parseInt(minAttack));
  }
  if (maxAttack) {
    query += ' AND attack <= ?';
    params.push(parseInt(maxAttack));
  }
  if (minDefense) {
    query += ' AND defense >= ?';
    params.push(parseInt(minDefense));
  }
  if (maxDefense) {
    query += ' AND defense <= ?';
    params.push(parseInt(maxDefense));
  }
  if (minSpeed) {
    query += ' AND speed >= ?';
    params.push(parseInt(minSpeed));
  }
  if (maxSpeed) {
    query += ' AND speed <= ?';
    params.push(parseInt(maxSpeed));
  }
  
  query += ' ORDER BY pokedex_number';
  
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// get one by ID
app.get('/api/pokemon/:id', (req, res) => {
    const id = req.params.id;
    db.get('SELECT * FROM pokemon WHERE pokedex_number = ?', [id], (err, row) => {
        if (!row) return res.status(404).json({ error: 'Pokémon not found' });
        res.json(row)
    })
})