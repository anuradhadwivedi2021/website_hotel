// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const randomBtn = document.getElementById('random-btn');
const categoryFilter = document.getElementById('category-filter');
const resultsGrid = document.getElementById('results');
const loadingSpinner = document.getElementById('loading-spinner');
const noResults = document.getElementById('no-results');
const themeToggle = document.getElementById('theme-toggle');
const modal = document.getElementById('recipe-modal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalIngredients = document.getElementById('modal-ingredients');
const modalInstructions = document.getElementById('modal-instructions');
const modalLink = document.getElementById('modal-link');
const closeModal = document.querySelector('.close');

// API Base URL
const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

// Load favorites and theme from localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

// Fetch and populate categories
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories.php`);
        const data = await response.json();
        data.categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.strCategory;
            option.textContent = cat.strCategory;
            categoryFilter.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Search recipes by ingredients
async function searchRecipes(ingredients) {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/filter.php?i=${ingredients}`);
        const data = await response.json();
        displayRecipes(data.meals || []);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        showNoResults();
    }
    hideLoading();
}

// Get random recipe
async function getRandomRecipe() {
    showLoading();
    try {
        const response = await fetch(`${API_BASE}/random.php`);
        const data = await response.json();
        displayRecipes(data.meals || []);
    } catch (error) {
        console.error('Error fetching random recipe:', error);
        showNoResults();
    }
    hideLoading();
}

// Display recipes
function displayRecipes(meals) {
    resultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
    if (!meals.length) {
        showNoResults();
        return;
    }
    const filteredMeals = categoryFilter.value ? meals.filter(meal => meal.strCategory === categoryFilter.value) : meals;
    filteredMeals.forEach(meal => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.innerHTML = `
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <div class="content">
                <h3>${meal.strMeal}</h3>
                <p>${meal.strCategory}</p>
                <div class="buttons">
                    <button class="view-btn" data-id="${meal.idMeal}">View Recipe</button>
                    <button class="favorite-btn ${favorites.includes(meal.idMeal) ? 'liked' : ''}" data-id="${meal.idMeal}">❤️</button>
                </div>
            </div>
        `;
        resultsGrid.appendChild(card);
    });
}

// Show recipe details in modal
async function showRecipeDetails(id) {
    try {
        const response = await fetch(`${API_BASE}/lookup.php?i=${id}`);
        const data = await response.json();
        const meal = data.meals[0];
        modalTitle.textContent = meal.strMeal;
        modalImage.src = meal.strMealThumb;
        modalInstructions.textContent = meal.strInstructions;
        modalLink.href = meal.strSource || '#';
        modalIngredients.innerHTML = '';
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
                const li = document.createElement('li');
                li.textContent = `${measure} ${ingredient}`;
                modalIngredients.appendChild(li);
            }
        }
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Error fetching recipe details:', error);
    }
}

// Toggle favorite
function toggleFavorite(id) {
    if (favorites.includes(id)) {
        favorites = favorites.filter(fav => fav !== id);
    } else {
        favorites.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateFavoriteButtons();
}

// Update favorite buttons
function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.classList.toggle('liked', favorites.includes(btn.dataset.id));
    });
}

// Utility functions
function showLoading() {
    loadingSpinner.classList.remove('hidden');
    resultsGrid.innerHTML = '';
    noResults.classList.add('hidden');
}

function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

function showNoResults() {
    noResults.classList.remove('hidden');
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const ingredients = searchInput.value.trim().replace(/\s+/g, '');
    if (ingredients) searchRecipes(ingredients);
});

randomBtn.addEventListener('click', getRandomRecipe);

categoryFilter.addEventListener('change', () => {
    const ingredients = searchInput.value.trim().replace(/\s+/g, '');
    if (ingredients) searchRecipes(ingredients);
});

themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

resultsGrid.addEventListener('click', (e) => {
    if (e.target.classList.contains('view-btn')) {
        showRecipeDetails(e.target.dataset.id);
    } else if (e.target.classList.contains('favorite-btn')) {
        toggleFavorite(e.target.dataset.id);
    }
});

closeModal.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
});

// Initialize
loadCategories();
updateFavoriteButtons();