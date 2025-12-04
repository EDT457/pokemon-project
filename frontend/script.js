const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'
  : `${window.location.origin}/api`;

const typeColors = {
  'normal': '#A8A878',
  'fire': '#F08030',
  'water': '#6890F0',
  'electric': '#F8D030',
  'grass': '#78C850',
  'ice': '#98D8D8',
  'fighting': '#C03028',
  'poison': '#A040A0',
  'ground': '#E0C068',
  'flying': '#A890F0',
  'psychic': '#F85888',
  'bug': '#A8B820',
  'rock': '#B8A038',
  'ghost': '#705898',
  'dragon': '#7038F8',
  'dark': '#705848',
  'steel': '#B8B8D0',
  'fairy': '#EE99AC'
};

// Fetch all pokemon and display them on page load
async function loadAllPokemon() {
  try {
    const response = await fetch(`${API_URL}/pokemon`);
    const pokemon = await response.json();
    displayPokemon(pokemon);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Display pokemon cards with type-based colors
function displayPokemon(pokemonList) {
  const container = document.getElementById('pokemon-container');
  
  if (!pokemonList || pokemonList.length === 0) {
    container.innerHTML = '<div class="no-results">No Pokémon found</div>';
    return;
  }
  
  container.innerHTML = '';
  
  pokemonList.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    const colors = getCardColor(pokemon.type1, pokemon.type2);
    
    card.style.backgroundColor = colors.background;
    if (colors.border) {
      card.style.borderColor = colors.border;
      card.style.borderWidth = '6px';
    }
    
    card.innerHTML = `
      <div class="card-header">
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png" alt="${pokemon.name}">
        <h2>${pokemon.name}</h2>
        <p>#${pokemon.pokedex_number}</p>
      </div>
      <div class="card-body">
        <p><strong>HP:</strong> ${pokemon.hp}</p>
        <p><strong>Attack:</strong> ${pokemon.attack}</p>
        <p><strong>Defense:</strong> ${pokemon.defense}</p>
        <p><strong>Sp. Attack:</strong> ${pokemon.sp_attack}</p>
        <p><strong>Sp. Defense:</strong> ${pokemon.sp_defense}</p>
        <p><strong>Speed:</strong> ${pokemon.speed}</p>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Use type1 color for background, type2 color for border if it exists
function getCardColor(type1, type2) {
  const cleanType1 = type1 ? type1.toLowerCase().trim() : '';
  const cleanType2 = type2 ? type2.toLowerCase().trim() : '';
  
  const color1 = typeColors[cleanType1] || '#FFFFFF';
  const color2 = typeColors[cleanType2];
  
  return { background: color1, border: color2 };
}


// Use type1 color, or average of both if there's type2
function getCardColor(type1, type2) {
  const cleanType1 = type1 ? type1.toLowerCase().trim() : '';
  const cleanType2 = type2 ? type2.toLowerCase().trim() : '';
  
  const color1 = typeColors[cleanType1] || '#FFFFFF';
  const color2 = typeColors[cleanType2];
  
  return { background: color1, border: color2 };
}


function performSearch() {
  const name = document.getElementById('search-name').value;
  const type = document.getElementById('search-type').value;
  const minHp = document.getElementById('search-minHp').value;
  const maxHp = document.getElementById('search-maxHp').value;
  const minAttack = document.getElementById('search-minAttack').value;
  const maxAttack = document.getElementById('search-maxAttack').value;
  
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (type) params.append('type', type);
  if (minHp) params.append('minHp', minHp);
  if (maxHp) params.append('maxHp', maxHp);
  if (minAttack) params.append('minAttack', minAttack);
  if (maxAttack) params.append('maxAttack', maxAttack);
  
  fetch(`${API_URL}/pokemon/search?${params}`)
    .then(response => response.json())
    .then(pokemon => {
      document.getElementById('pokemon-container').innerHTML = '';
      displayPokemon(pokemon);
    })
    .catch(error => console.error('Error:', error));
}

function clearSearch() {
  document.getElementById('search-name').value = '';
  document.getElementById('search-type').value = '';
  document.getElementById('search-minHp').value = '';
  document.getElementById('search-maxHp').value = '';
  document.getElementById('search-minAttack').value = '';
  document.getElementById('search-maxAttack').value = '';
  
  loadAllPokemon();
}

// Auth modal functions
function openLoginModal() {
  document.getElementById('auth-modal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function switchTab(tab) {
  document.getElementById('login-tab').classList.remove('active');
  document.getElementById('register-tab').classList.remove('active');
  document.getElementById(tab + '-tab').classList.add('active');
}

async function handleRegister() {
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  if (!username || !email || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert('Error: ' + data.error);
      return;
    }
    
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    
    alert('Registration successful!');
    closeLoginModal();
    updateAuthUI();
  } catch (error) {
    console.error('Register error:', error);
    alert('Registration failed');
  }
}

async function handleLogin() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  if (!username || !password) {
    alert('Please fill in all fields');
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      alert('Error: ' + data.error);
      return;
    }
    
    // Save token to localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.user.username);
    
    alert('Login successful!');
    closeLoginModal();
    updateAuthUI();
  } catch (error) {
    console.error('Login error:', error);
    alert('Login failed');
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  updateAuthUI();
}

function updateAuthUI() {
  const authSection = document.getElementById('auth-section');
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username');
  
  if (token) {
    authSection.innerHTML = `
      <span style="font-size: 0.6em;">Welcome, ${username}!</span>
      <button onclick="handleLogout()">Logout</button>
      <button id="dark-mode-btn" onclick="toggleDarkMode()">🌙</button>
    `;
  } else {
    authSection.innerHTML = '<button id="login-btn" onclick="openLoginModal()">Login</button><button id="dark-mode-btn" onclick="toggleDarkMode()">🌙</button>';
  }
}

function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Check on page load
if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
}

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('auth-modal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}

// Check auth status on page load
document.addEventListener('DOMContentLoaded', function() {
  updateAuthUI();
});

// Call the function when page loads
loadAllPokemon();