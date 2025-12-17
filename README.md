# Pokémon Search App

A full-stack web application for searching and filtering Generation 1 Pokémon with user authentication and dark mode support.

**Live Demo:** [pokemon-project-production-314b.up.railway.app](https://pokemon-project-production-314b.up.railway.app)

## Features

- 🔍 **Search & Filter** - Find Pokémon by name, type, and stat ranges (HP, Attack)
- 👤 **User Authentication** - Register and login with secure JWT-based sessions
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🎨 **Type-Based Styling** - Cards display primary type background with secondary type border
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎮 **Retro Aesthetic** - Press Start 2P font for nostalgic Game Boy feel

## Tech Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- PostgreSQL

### Deployment
- Railway (frontend, backend, and database)

## Project Structure

```
pokemon-project/
├── frontend/
│   ├── index.html          # Main page structure
│   ├── style.css           # Styling with dark mode support
│   └── script.js           # Frontend logic and API calls
├── server.js               # Express backend server
├── data/
│   └── pokemon.csv         # Generation 1 Pokémon dataset from Kaggle
└── package.json            # Node.js dependencies
```

## API Endpoints

### Pokémon Endpoints

- `GET /api/pokemon` - Get all Pokémon
- `GET /api/pokemon/:id` - Get specific Pokémon by pokedex_number
- `GET /api/pokemon/search` - Search with filters
  - Query params: `name`, `type1`, `minHp`, `maxHp`, `minAttack`, `maxAttack`

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
  - Body: `{ username, email, password }`
- `POST /api/auth/login` - Login user
  - Body: `{ username, password }`

## Search Functionality

Search by:
- **Name** - Partial match (case-insensitive)
- **Type** - Primary or secondary typing
- **HP** - Minimum and maximum values
- **Attack** - Minimum and maximum values

All filters can be combined for precise queries.

## Database Schema

### pokemon table
```sql
CREATE TABLE pokemon (
    pokedex_number INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    hp INTEGER,
    attack INTEGER,
    defense INTEGER,
    sp_attack INTEGER,
    sp_defense INTEGER,
    speed INTEGER,
    type1 TEXT,
    type2 TEXT,
    abilities TEXT
);
```

### users table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Future Improvements

### Security
- Add token expiration to JWT
- Implement rate limiting on auth endpoints
- Add password validation requirements
- Use httpOnly cookies instead of localStorage

### Features
- Favorites system to bookmark Pokémon
X Pagination for large result sets
- Advanced filtering (weakness matchups, etc.)
- Sorting by stats

- Utilize pokemon database to develop a game

### Performance
- Add database indexes on frequently searched columns
- Implement caching layer
- Optimize image loading

### Testing & DevOps
- Add automated tests
- CI/CD pipeline
- Logging and monitoring
- Docker containerization

## Data Source

Pokémon data sourced from [Kaggle's Pokémon Dataset](https://www.kaggle.com/rounakbanik/pokemon). Currently includes Generation 1 Pokémon (151 species).

Sprites sourced from [PokéAPI](https://pokeapi.co/).


## Author

Ethan Tan
