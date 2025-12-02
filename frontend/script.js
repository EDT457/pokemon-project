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

// Fetch all Pokémon on page load
async function loadAllPokemon() {
  try {
    const response = await fetch(`${API_URL}/pokemon`);
    const pokemon = await response.json();
    displayPokemon(pokemon);
  } catch (error) {
    console.error('Error:', error);
  }
}

function displayPokemon(pokemonList) {
  const container = document.getElementById('pokemon-container');
  
  pokemonList.forEach(pokemon => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    const bgColor = getCardColor(pokemon.type1, pokemon.type2);
    card.style.backgroundColor = bgColor;
    
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

function getCardColor(type1, type2) {
  // Use type1 color, or average of both if there's type2
  return typeColors[type1] || '#FFFFFF';
}

function performSearch() {
  const name = document.getElementById('search-name').value;
  const type1 = document.getElementById('search-type').value;
  const minHp = document.getElementById('search-minHp').value;
  const maxHp = document.getElementById('search-maxHp').value;
  const minAttack = document.getElementById('search-minAttack').value;
  const maxAttack = document.getElementById('search-maxAttack').value;
  
  const params = new URLSearchParams();
  if (name) params.append('name', name);
  if (type1) params.append('type1', type1);
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

// Call the function when page loads
loadAllPokemon();