let weatherApiBase = '/api';

async function fetchWeatherData(location) {
	const endpoint = `/weather?city=${encodeURIComponent(location)}`;
	let response;

	try {
		response = await fetch(`${weatherApiBase}${endpoint}`);
	} catch (networkErr) {
		// Automatically fallback to port 3000 if proxy or relative path fails
		if (weatherApiBase === '/api') {
			weatherApiBase = 'http://localhost:3000/api';
			response = await fetch(`${weatherApiBase}${endpoint}`);
		} else {
			throw networkErr;
		}
	}

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		const errorMsg =
			errorData.message ||
			`Weather service error (${response.status}): ${response.statusText}`;
		throw new Error(errorMsg);
	}

	return await response.json();
}

class parseWeatherData {
	constructor(weatherData) {
		this.weatherData = weatherData;
	}

	getCurrentWeather() {
		return this.weatherData.currentConditions;
	}

	getDailyWeather() {
		return this.weatherData.days;
	}

	getHourlyWeather() {
		return [...this.weatherData.days[0].hours, ...this.weatherData.days[1].hours];
	}
}

export { fetchWeatherData, parseWeatherData };