import './style.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css';
import renderWeatherData from './components/renderParsedData.js';
import { fetchWeatherData, parseWeatherData } from './components/fetchWeather.js';

let apiBaseUrl = '/api';
let currentFavorites = [];
let currentLoadedCity = 'berlin';

// Robust fetch helper with automatic fallback to port 3000
async function apiFetch(endpoint, options = {}) {
	try {
		const res = await fetch(`${apiBaseUrl}${endpoint}`, options);
		return res;
	} catch (err) {
		if (apiBaseUrl === '/api') {
			apiBaseUrl = 'http://localhost:3000/api';
			return await fetch(`${apiBaseUrl}${endpoint}`, options);
		}
		throw err;
	}
}

// -------------------------------------------------------------
// Favorites Service & UI
// -------------------------------------------------------------

async function loadFavorites() {
	try {
		const res = await apiFetch('/favorites');
		if (!res.ok) throw new Error('Could not fetch favorites');
		currentFavorites = await res.json();
	} catch (error) {
		console.warn('Backend server not reachable or favorites failed:', error.message);
		currentFavorites = [];
	}
	renderFavoritesBar();
	syncCurrentCityFavoriteState();
}

function renderFavoritesBar() {
	const listContainer = document.getElementById('favorites-list');
	if (!listContainer) return;

	if (!currentFavorites || currentFavorites.length === 0) {
		listContainer.innerHTML = '<span class="text-xs text-text-disabled italic">No favorite cities saved</span>';
		return;
	}

	listContainer.innerHTML = currentFavorites
		.map(
			(fav) => {
				const cityName = fav.name || fav.city;
				return `
			<div class="flex items-center gap-1.5 bg-surface hover:bg-surface-2 px-3 py-1 rounded-full text-xs font-medium text-text transition group cursor-pointer border border-border-strong/40" data-city="${cityName}">
				<span class="favorite-item-title">${cityName}</span>
				<button class="remove-fav-btn text-text-3 hover:text-red-400 ml-1 transition p-0.5 rounded cursor-pointer" data-city="${cityName}" title="Remove ${cityName}">
					<i class="ti ti-x text-xs"></i>
				</button>
			</div>
		`;
			}
		)
		.join('');

	// Click to view favorite weather
	listContainer.querySelectorAll('.favorite-item-title').forEach((item) => {
		item.addEventListener('click', (e) => {
			const city = e.currentTarget.closest('[data-city]').getAttribute('data-city');
			loadWeather(city);
		});
	});

	// Remove button
	listContainer.querySelectorAll('.remove-fav-btn').forEach((btn) => {
		btn.addEventListener('click', async (e) => {
			e.stopPropagation();
			const city = btn.getAttribute('data-city');
			await removeFavorite(city);
		});
	});
}

function isCurrentCityFavorited(cityName) {
	if (!cityName) return false;
	const clean = cityName.trim().toLowerCase();
	return currentFavorites.some(
		(fav) => {
			const name = (fav.name || fav.city || '').toLowerCase();
			return name === clean || fav.id === clean || fav._id === clean;
		}
	);
}

function syncCurrentCityFavoriteState() {
	const favBtn = document.getElementById('favorite-btn');
	if (!favBtn) return;

	const isFav = isCurrentCityFavorited(currentLoadedCity);
	const icon = favBtn.querySelector('i');
	if (icon) {
		icon.className = `ti ${isFav ? 'ti-star-filled' : 'ti-star'}`;
	}
	favBtn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
}

async function addFavorite(cityName) {
	try {
		const res = await apiFetch('/favorites', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ city: cityName }),
		});

		const data = await res.json();
		if (!res.ok) {
			alert(data.message || 'Failed to save favorite.');
			return;
		}

		currentFavorites.push(data);
		renderFavoritesBar();
		syncCurrentCityFavoriteState();
	} catch (err) {
		console.error('Error adding favorite:', err);
		alert('Could not save favorite. Is the backend server running?');
	}
}

async function removeFavorite(cityName) {
	try {
		const res = await apiFetch(`/favorites/${encodeURIComponent(cityName)}`, {
			method: 'DELETE',
		});

		if (!res.ok) {
			const data = await res.json();
			alert(data.message || 'Failed to remove favorite.');
			return;
		}

		const clean = cityName.trim().toLowerCase();
		currentFavorites = currentFavorites.filter((fav) => {
			const name = (fav.name || fav.city || '').toLowerCase();
			return name !== clean && fav.id !== clean && fav._id !== clean;
		});
		renderFavoritesBar();
		syncCurrentCityFavoriteState();
	} catch (err) {
		console.error('Error removing favorite:', err);
	}
}

// -------------------------------------------------------------
// Weather Loader
// -------------------------------------------------------------

function loadWeather(locationName) {
	currentLoadedCity = locationName;
	fetchWeatherData(locationName)
		.then((weatherData) => {
			const parsedWeatherData = new parseWeatherData(weatherData);
			const isFav = isCurrentCityFavorited(locationName);
			const renderHtml = new renderWeatherData(parsedWeatherData, locationName, isFav);
			renderHtml.render();

			// Attach listener to newly rendered favorite button
			const favBtn = document.getElementById('favorite-btn');
			if (favBtn) {
				favBtn.addEventListener('click', async () => {
					const city = favBtn.getAttribute('data-city') || locationName;
					if (isCurrentCityFavorited(city)) {
						await removeFavorite(city);
					} else {
						await addFavorite(city);
					}
				});
			}
		})
		.catch((error) => {
			console.error('Error loading weather data:', error);
			alert(`Could not load weather for "${locationName}": ${error.message}`);
		});
}

function init() {
	// Initialize favorites from Node.js backend
	loadFavorites();

	// Load initial weather
	loadWeather('berlin');

	// Search handler
	const searchInput = document.getElementById('search');
	if (searchInput) {
		searchInput.addEventListener('keypress', (e) => {
			if (e.key === 'Enter' && searchInput.value.trim()) {
				loadWeather(searchInput.value.trim());
			}
		});
	}

	// Hourly toggle
	const hourlyToggle = document.getElementById('hourly-toggle');
	if (hourlyToggle) {
		hourlyToggle.addEventListener('click', () => {
			const hourlyContainer = document.querySelector('.hourly-container');
			if (hourlyContainer) {
				hourlyContainer.classList.toggle('expanded');
			}
			if (hourlyToggle.children[1]) {
				hourlyToggle.children[1].classList.toggle('toggle-arrow');
			}
		});
	}
}

init();
