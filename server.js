require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Favorite = require('./models/Favorite');

const app = express();
const PORT = process.env.PORT || 3000;

// Utility to escape regex special characters for safe queries
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

// -------------------------------------------------------------
// Custom Middleware
// -------------------------------------------------------------

// 1. Request Logger Middleware
app.use((req, res, next) => {
	const start = Date.now();
	const timestamp = new Date().toISOString();

	res.on('finish', () => {
		const duration = Date.now() - start;
		console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
	});

	next();
});

// 2. CORS & JSON Body Parsing
app.use(cors());
app.use(express.json());

// 3. Input Validation Middleware for City Name
function validateCityInput(req, res, next) {
	const { city } = req.body || {};

	if (!city || typeof city !== 'string') {
		return res.status(400).json({
			error: 'Bad Request',
			message: 'Field "city" is required and must be a string.',
		});
	}

	const trimmedCity = city.trim();
	if (trimmedCity.length < 2 || trimmedCity.length > 80) {
		return res.status(400).json({
			error: 'Validation Error',
			message: 'City name must be between 2 and 80 characters.',
		});
	}

	// Basic safety check: allow letters, spaces, hyphens, and commas (e.g., "Paris", "New York", "London, UK")
	const validCityRegex = /^[a-zA-Z\u0080-\uFFFF\s,.-]+$/;
	if (!validCityRegex.test(trimmedCity)) {
		return res.status(400).json({
			error: 'Validation Error',
			message: 'City name contains invalid characters.',
		});
	}

	// Attach normalized city to request
	req.cleanCity = trimmedCity;
	next();
}

// -------------------------------------------------------------
// Favorites Endpoints (Mongoose / MongoDB Atlas)
// -------------------------------------------------------------

// GET all favorites
app.get('/api/favorites', async (req, res, next) => {
	try {
		const favorites = await Favorite.find().sort({ createdAt: -1 });
		res.json(favorites);
	} catch (err) {
		next(err);
	}
});

// POST a new favorite city
app.post('/api/favorites', validateCityInput, async (req, res, next) => {
	try {
		// Case-insensitive query check for duplicates before creating
		const existing = await Favorite.findOne({
			city: new RegExp(`^${escapeRegex(req.cleanCity)}$`, 'i'),
		});

		if (existing) {
			return res.status(409).json({
				error: 'Conflict',
				message: `"${req.cleanCity}" is already in your favorites.`,
			});
		}

		const newFavorite = await Favorite.create({ city: req.cleanCity });
		res.status(201).json(newFavorite);
	} catch (err) {
		next(err);
	}
});

// DELETE a favorite city by name or ID
app.delete('/api/favorites/:city', async (req, res, next) => {
	try {
		const target = decodeURIComponent(req.params.city).trim();
		let deleted = null;

		// 1. Attempt to remove by MongoDB ObjectId if target is a valid ObjectId
		if (mongoose.isValidObjectId(target)) {
			deleted = await Favorite.findByIdAndDelete(target);
		}

		// 2. If not found by ObjectId, attempt to remove by case-insensitive city name
		if (!deleted) {
			deleted = await Favorite.findOneAndDelete({
				city: new RegExp(`^${escapeRegex(target)}$`, 'i'),
			});
		}

		if (!deleted) {
			return res.status(404).json({
				error: 'Not Found',
				message: `City "${req.params.city}" not found in favorites.`,
			});
		}

		res.json({
			message: `City "${req.params.city}" successfully removed from favorites.`,
		});
	} catch (err) {
		next(err);
	}
});

// -------------------------------------------------------------
// Weather Proxy Endpoint
// -------------------------------------------------------------

app.get('/api/weather', async (req, res, next) => {
	try {
		const rawCity = req.query.city || req.query.location;

		if (!rawCity || typeof rawCity !== 'string' || !rawCity.trim()) {
			return res.status(400).json({
				error: 'Bad Request',
				message: 'Query parameter "city" is required (e.g. /api/weather?city=London).',
			});
		}

		const city = rawCity.trim();
		const apiKey = process.env.WEATHER_API_KEY;

		if (!apiKey || apiKey === 'your_api_key_here') {
			return res.status(500).json({
				error: 'Configuration Error',
				message:
					'WEATHER_API_KEY is not configured on the server. Please add your key to the .env file in the project root.',
			});
		}

		const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(city)}?unitGroup=metric&key=${apiKey}&contentType=json&include=days,hours,current`;

		const response = await fetch(url);

		if (!response.ok) {
			const errorText = await response.text();
			return res.status(response.status).json({
				error: 'Weather Provider Error',
				message: errorText || `Visual Crossing returned status ${response.status}`,
			});
		}

		const weatherData = await response.json();
		res.json(weatherData);
	} catch (err) {
		next(err);
	}
});

// -------------------------------------------------------------
// Fallback & Central Error Handling Middleware
// -------------------------------------------------------------

// 404 handler for unmatched API routes
app.use('/api', (req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message: `Route ${req.method} ${req.originalUrl} does not exist.`,
	});
});

// Central Error Handler
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
	console.error('[Error Handler]', err);

	// 1. Mongoose duplicate key error (code 11000)
	if (err.code === 11000) {
		const field = Object.keys(err.keyValue || {})[0] || 'city';
		const value = err.keyValue ? err.keyValue[field] : (req.cleanCity || 'City');
		return res.status(409).json({
			error: 'Conflict',
			message: `"${value}" is already in your favorites.`,
		});
	}

	// 2. Mongoose validation error
	if (err.name === 'ValidationError') {
		const message = Object.values(err.errors)
			.map((e) => e.message)
			.join(', ');
		return res.status(400).json({
			error: 'Validation Error',
			message: message || 'Validation failed for model.',
		});
	}

	// 3. Mongoose CastError (e.g., malformed ObjectId)
	if (err.name === 'CastError') {
		return res.status(400).json({
			error: 'Bad Request',
			message: `Invalid format for field "${err.path}": "${err.value}".`,
		});
	}

	const status = err.status || 500;
	res.status(status).json({
		error: err.name || 'InternalServerError',
		message: err.message || 'An unexpected error occurred.',
	});
}

app.use(errorHandler);

// -------------------------------------------------------------
// Server Initialization: Connect DB before starting Express
// -------------------------------------------------------------

async function startServer() {
	try {
		await connectDB();
		app.listen(PORT, () => {
			console.log(`Weather Wise Node.js server running on http://localhost:${PORT}`);
		});
	} catch (err) {
		console.error('[Startup Error] Failed to start server:', err.message);
		process.exit(1);
	}
}

// Start the server only if run directly
if (require.main === module) {
	startServer();
}

module.exports = { app, startServer, errorHandler };
