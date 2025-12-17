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

let comparisonList = [];
const MAX_COMPARISON = 3;

// Pagination state
let currentPage = 1;
let totalResults = 0;
let itemsPerPage = 20;
let currentFilters = {};

/*
    Pokemon display functions
*/

// Fetch all pokemon and display them on page load
async function loadAllPokemon() {
    try {
        const response = await fetch(`${API_URL}/pokemon`);
        const result = await response.json();
        
        // Handle both array and object responses
        if (Array.isArray(result)) {
            displayPokemon(result);
        } else {
            totalResults = result.count;
            displayPokemon(result.pokemon, { totalResults: result.count });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Display pokemon cards with type-based colors
function displayPokemon(pokemonList, paginationInfo = null) {
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
                <button class="compare-btn" onclick="toggleComparison(${pokemon.pokedex_number}, '${pokemon.name}')">
                    Compare
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    // Add pagination controls if needed
    if (paginationInfo && paginationInfo.totalResults > itemsPerPage) {
        addPaginationControls(paginationInfo);
    }
}

// Get card colors based on pokemon types
function getCardColor(type1, type2) {
    const cleanType1 = type1 ? type1.toLowerCase().trim() : '';
    const cleanType2 = type2 ? type2.toLowerCase().trim() : '';

    const color1 = typeColors[cleanType1] || '#FFFFFF';
    const color2 = typeColors[cleanType2];

    return { background: color1, border: color2 };
}

/*
    Search and filter functions
*/

// Real-time search with debouncing and pagination
const performRealTimeSearch = debounce(async function() {
    const name = document.getElementById('search-name').value.trim();
    const type = document.getElementById('search-type').value;
    const minHp = document.getElementById('search-minHp').value;
    const maxHp = document.getElementById('search-maxHp').value;
    const minAttack = document.getElementById('search-minAttack').value;
    const maxAttack = document.getElementById('search-maxAttack').value;

    // Show loading indicator
    const container = document.getElementById('pokemon-container');
    container.innerHTML = '<div class="loading">Searching...</div>';

    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (type) params.append('type1', type);
    if (minHp) params.append('minHp', minHp);
    if (maxHp) params.append('maxHp', maxHp);
    if (minAttack) params.append('minAttack', minAttack);
    if (maxAttack) params.append('maxAttack', maxAttack);

    // Add pagination params
    const offset = (currentPage - 1) * itemsPerPage;
    params.append('limit', itemsPerPage);
    params.append('offset', offset);

    try {
        const response = await fetch(`${API_URL}/pokemon/search?${params}`);
        const result = await response.json();
        
        // Handle both array response and object with count
        if (Array.isArray(result)) {
            displayPokemon(result);
        } else {
            totalResults = result.count;
            displayPokemon(result.pokemon, { totalResults: result.count });
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<div class="error">Search failed. Try again.</div>';
    }
}, 500);

// Load all pokemon with pagination
async function loadAllPokemonPaginated() {
    try {
        const offset = (currentPage - 1) * itemsPerPage;
        const response = await fetch(`${API_URL}/pokemon?limit=${itemsPerPage}&offset=${offset}`);
        const result = await response.json();
        
        if (Array.isArray(result)) {
            // If it's just an array, get total count first
            const allResponse = await fetch(`${API_URL}/pokemon`);
            const allPokemon = await allResponse.json();
            totalResults = allPokemon.length;
            displayPokemon(result, { totalResults });
        } else {
            totalResults = result.count;
            displayPokemon(result.pokemon, { totalResults: result.count });
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Clear search filters and reload all pokemon
function clearSearch() {
    document.getElementById('search-name').value = '';
    document.getElementById('search-type').value = '';
    document.getElementById('search-minHp').value = '';
    document.getElementById('search-maxHp').value = '';
    document.getElementById('search-minAttack').value = '';
    document.getElementById('search-maxAttack').value = '';

    loadAllPokemon();
}

/*
    Authentication functions
*/

// Open login/register modal
function openLoginModal() {
    document.getElementById('auth-modal').style.display = 'block';
}

// Close login/register modal
function closeLoginModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

// Switch between login and register tabs
function switchTab(tab) {
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.remove('active');
    document.getElementById(tab + '-tab').classList.add('active');
}

// Handle user registration
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

// Handle user login
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

// Handle user logout
function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateAuthUI();
}

// Update UI based on authentication status
function updateAuthUI() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    const backBtn = document.getElementById('back-btn');
    const loginBtn = document.getElementById('login-btn');
    
    if (token) {
        // Show pomodoro button, hide login button
        if (pomodoroBtn) pomodoroBtn.style.display = 'inline-block';
        if (loginBtn) loginBtn.style.display = 'none';
    } else {
        // Show login button, hide pomodoro and back buttons
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (pomodoroBtn) pomodoroBtn.style.display = 'none';
        if (backBtn) backBtn.style.display = 'none';
    }
    
    updateButtonVisibility();
}
/*
    Theme and UI functions
*/

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Check dark mode preference on page load
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
}

/*
    Event listeners
*/

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    loadAllPokemon();
});

// Toggle pokemon in comparison list
function toggleComparison(id, name) {
    const existingIndex = comparisonList.findIndex(p => p.id === id);
    
    if (existingIndex !== -1) {
        // Remove from comparison
        comparisonList.splice(existingIndex, 1);
    } else {
        // Add to comparison
        if (comparisonList.length >= MAX_COMPARISON) {
            alert(`You can only compare up to ${MAX_COMPARISON} Pokémon at once`);
            return;
        }
        comparisonList.push({ id, name });
    }
    
    updateComparisonUI();
}

// Update the comparison bar UI
function updateComparisonUI() {
    const comparisonBar = document.getElementById('comparison-bar');
    
    if (comparisonList.length === 0) {
        comparisonBar.style.display = 'none';
        // Don't return early - still need to update buttons!
    } else {
        comparisonBar.style.display = 'block';
        comparisonBar.innerHTML = `
            <div class="comparison-content">
                <span>Comparing: ${comparisonList.map(p => p.name).join(', ')}</span>
                <button onclick="openComparisonModal()">View Comparison</button>
                <button onclick="clearComparison()">Clear</button>
            </div>
        `;
    }
    
    // Update button states on cards (moved outside the if/else)
    document.querySelectorAll('.compare-btn').forEach(btn => {
        const pokemonId = parseInt(btn.getAttribute('onclick').match(/\d+/)[0]);
        if (comparisonList.some(p => p.id === pokemonId)) {
            btn.textContent = 'Remove';
            btn.classList.add('selected');
        } else {
            btn.textContent = 'Compare';
            btn.classList.remove('selected');
        }
    });
}

// Clear all comparisons
function clearComparison() {
    comparisonList = [];
    updateComparisonUI();
}

// Open comparison modal and fetch data
async function openComparisonModal() {
    if (comparisonList.length < 2) {
        alert('Select at least 2 Pokémon to compare');
        return;
    }
    
    // Fetch full data for each selected Pokémon
    const pokemonData = await Promise.all(
        comparisonList.map(p => fetch(`${API_URL}/pokemon/${p.id}`).then(res => res.json()))
    );
    
    displayComparison(pokemonData);
    document.getElementById('comparison-modal').style.display = 'block';
}

// Close comparison modal
function closeComparisonModal() {
    document.getElementById('comparison-modal').style.display = 'none';
}

// Display the comparison table with stat differences and winners
function displayComparison(pokemonList) {
    const container = document.getElementById('comparison-display');
    
    const stats = ['hp', 'attack', 'defense', 'sp_attack', 'sp_defense', 'speed'];
    const statLabels = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        sp_attack: 'Sp. Attack',
        sp_defense: 'Sp. Defense',
        speed: 'Speed'
    };
    
    // Build comparison table
    let html = '<div class="comparison-grid">';
    
    // Header row with Pokémon names
    html += '<div class="comparison-row header-row">';
    html += '<div class="stat-label">Stat</div>';
    pokemonList.forEach(pokemon => {
        const colors = getCardColor(pokemon.type1, pokemon.type2);
        html += `
            <div class="pokemon-header" style="background-color: ${colors.background}; border-color: ${colors.border || 'black'};">
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
                <p>${pokemon.type1}${pokemon.type2 ? ' / ' + pokemon.type2 : ''}</p>
            </div>
        `;
    });
    html += '</div>';
    
    // Stat rows
    stats.forEach(stat => {
        html += '<div class="comparison-row">';
        html += `<div class="stat-label">${statLabels[stat]}</div>`;
        
        // Find the max and min values for this stat
        const values = pokemonList.map(p => p[stat]);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const avgValue = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        
        pokemonList.forEach((pokemon, index) => {
            const value = pokemon[stat];
            const isMax = value === maxValue;
            const isMin = value === minValue;
            const percentage = (value / 255) * 100; // Max stat is 255
            
            // Calculate difference from average
            const diff = value - avgValue;
            const diffText = diff > 0 ? `+${diff}` : `${diff}`;
            const diffClass = diff > 0 ? 'positive-diff' : diff < 0 ? 'negative-diff' : 'neutral-diff';
            
            html += `
                <div class="stat-cell ${isMax ? 'max-stat' : ''} ${isMin ? 'min-stat' : ''}">
                    <div class="stat-header">
                        <div class="stat-value">${value}</div>
                        <div class="stat-diff ${diffClass}">${diffText}</div>
                    </div>
                    <div class="stat-bar-container">
                        <div class="stat-bar-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    });
    
    // Total stats row
    html += '<div class="comparison-row total-row">';
    html += '<div class="stat-label"><strong>Total</strong></div>';
    const totals = pokemonList.map(pokemon => stats.reduce((sum, stat) => sum + pokemon[stat], 0));
    const maxTotal = Math.max(...totals);
    
    pokemonList.forEach((pokemon, index) => {
        const total = totals[index];
        const isMaxTotal = total === maxTotal;
        html += `<div class="stat-cell ${isMaxTotal ? 'max-stat' : ''}"><strong>${total}</strong>${isMaxTotal ? '<div class="winner-badge">👑</div>' : ''}</div>`;
    });
    html += '</div>';
    
    html += '</div>';
    
    container.innerHTML = html;
}

// Debounce function to limit API calls
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

// Add pagination controls to the page
function addPaginationControls(paginationInfo) {
    const container = document.getElementById('pokemon-container');
    const totalPages = Math.ceil(paginationInfo.totalResults / itemsPerPage);

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    paginationDiv.style.gridColumn = '1 / -1';

    let paginationHTML = '<div class="pagination-info">';
    paginationHTML += `Showing ${(currentPage - 1) * itemsPerPage + 1} - ${Math.min(currentPage * itemsPerPage, paginationInfo.totalResults)} of ${paginationInfo.totalResults}`;
    paginationHTML += '</div>';

    paginationHTML += '<div class="pagination-buttons">';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    } else {
        paginationHTML += '<button disabled>← Previous</button>';
    }

    // Page numbers
    for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="current-page">${i}</button>`;
        } else {
            paginationHTML += `<button onclick="goToPage(${i})">${i}</button>`;
        }
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button onclick="goToPage(${currentPage + 1})">Next →</button>`;
    } else {
        paginationHTML += '<button disabled>Next →</button>';
    }

    paginationHTML += '</div>';
    paginationDiv.innerHTML = paginationHTML;

    container.appendChild(paginationDiv);
}

// Go to specific page
function goToPage(pageNumber) {
    console.log('Going to page:', pageNumber);
    currentPage = pageNumber;
    performRealTimeSearch();
}

/*
    Pomodoro Timer Functions
*/

let timerInterval = null;
let timeRemaining = 5; // 5 seconds for testing
let caughtPokemon = [];

// Switch to Pomodoro section
function switchToPomodoro() {
    // Hide main content
    const navbar = document.getElementById('navbar');
    const searchContainer = document.getElementById('search-container');
    const pokemonContainer = document.getElementById('pokemon-container');
    const comparisonBar = document.getElementById('comparison-bar');
    const pomodoroSection = document.getElementById('pomodoro-section');
    
    if (navbar) navbar.style.display = 'none';
    if (searchContainer) searchContainer.style.display = 'none';
    if (pokemonContainer) pokemonContainer.style.display = 'none';
    if (comparisonBar) comparisonBar.style.display = 'none';
    if (pomodoroSection) pomodoroSection.style.display = 'block';
    
    updateButtonVisibility();
    loadCaughtPokemon();
}

// Switch back to main app
function switchToMain() {
    const navbar = document.getElementById('navbar');
    const searchContainer = document.getElementById('search-container');
    const pokemonContainer = document.getElementById('pokemon-container');
    const pomodoroSection = document.getElementById('pomodoro-section');
    
    if (navbar) navbar.style.display = 'flex';
    if (searchContainer) searchContainer.style.display = 'flex';
    if (pokemonContainer) pokemonContainer.style.display = 'grid';
    if (pomodoroSection) pomodoroSection.style.display = 'none';
    
    updateButtonVisibility();
}

// Start the timer
function startTimer() {
    timeRemaining = 5; // 5 seconds for testing
    document.getElementById('start-timer-btn').style.display = 'none';
    document.getElementById('stop-timer-btn').style.display = 'inline-block';
    
    updateTimerDisplay();
    
    timerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            endSession();
        }
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
    timeRemaining = 5;
    updateTimerDisplay();
    document.getElementById('start-timer-btn').style.display = 'inline-block';
    document.getElementById('stop-timer-btn').style.display = 'none';
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer-value').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// End session and trigger encounter
async function endSession() {
    document.getElementById('start-timer-btn').style.display = 'inline-block';
    document.getElementById('stop-timer-btn').style.display = 'none';
    
    // Get random Pokemon
    const randomId = Math.floor(Math.random() * 151) + 1;
    
    try {
        const response = await fetch(`${API_URL}/pokemon/${randomId}`);
        const pokemon = await response.json();
        showEncounter(pokemon);
    } catch (error) {
        console.error('Error fetching Pokémon:', error);
    }
}

// Show encounter modal
function showEncounter(pokemon) {
    const encounterDiv = document.getElementById('encounter-display');
    const pokemonDiv = document.getElementById('encounter-pokemon');
    
    pokemonDiv.innerHTML = `
        <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokedex_number}.png" alt="${pokemon.name}">
        <h3>${pokemon.name}</h3>
        <p>${pokemon.type1}${pokemon.type2 ? ' / ' + pokemon.type2 : ''}</p>
    `;
    
    encounterDiv.style.display = 'block';
    
    // Store current encounter
    window.currentEncounter = pokemon;
}

// Catch the Pokemon
function catchPokemon() {
    const pokemon = window.currentEncounter;
    
    // Add to caught list
    caughtPokemon.push({
        id: pokemon.pokedex_number,
        name: pokemon.name,
        caughtAt: new Date().toLocaleTimeString()
    });
    
    // Save to localStorage
    localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    
    // Show success message
    alert(`Caught ${pokemon.name}! 🎉`);
    
    skipEncounter();
    loadCaughtPokemon();
}

// Skip encounter
function skipEncounter() {
    document.getElementById('encounter-display').style.display = 'none';
    window.currentEncounter = null;
}

// Load caught Pokemon from localStorage
async function loadCaughtPokemon() {
    const saved = localStorage.getItem('caughtPokemon');
    caughtPokemon = saved ? JSON.parse(saved) : [];
    
    const container = document.getElementById('caught-pokemon');
    
    if (caughtPokemon.length === 0) {
        container.innerHTML = '<p style="grid-column: 1 / -1; text-align: center;">No Pokémon caught yet!</p>';
        return;
    }
    
    // Fetch pokemon data to get images
    const pokemonDataPromises = caughtPokemon.map(p => 
        fetch(`${API_URL}/pokemon/${p.id}`).then(res => res.json()).catch(err => null)
    );
    
    const pokemonData = await Promise.all(pokemonDataPromises);
    
    container.innerHTML = caughtPokemon.map((p, index) => {
        const data = pokemonData[index];
        const imageUrl = data ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.pokedex_number}.png` : '';
        
        return `
            <div class="caught-pokemon-card">
                ${imageUrl ? `<img src="${imageUrl}" alt="${p.name}">` : ''}
                <p><strong>${p.name}</strong></p>
                <p style="font-size: 0.6em;">${p.caughtAt}</p>
                <button onclick="removeCaughtPokemon(${index})" style="width: 100%; padding: 5px; font-size: 0.5em;">Remove</button>
            </div>
        `;
    }).join('');
}

// Remove caught Pokemon
function removeCaughtPokemon(index) {
    caughtPokemon.splice(index, 1);
    localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
    loadCaughtPokemon();
}

// Check if we're in pomodoro and show/hide back button accordingly
function updateButtonVisibility() {
    const pomodoroSection = document.getElementById('pomodoro-section');
    const backBtn = document.getElementById('back-btn');
    const pomodoroBtn = document.getElementById('pomodoro-btn');
    
    if (!backBtn || !pomodoroBtn) return;
    
    if (pomodoroSection && pomodoroSection.style.display === 'block') {
        backBtn.style.display = 'inline-block';
        pomodoroBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'none';
        pomodoroBtn.style.display = 'inline-block';
    }
}