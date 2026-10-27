/**
 * Weather Icon Mapping
 * Maps Visual Crossing API icon names to @bybas/weather-icons SVGs
 */

const weatherIconMap = {
	// === iconSet=icons1 (default) ===
	'snow': require('@bybas/weather-icons/production/fill/all/snow.svg'),
	'rain': require('@bybas/weather-icons/production/fill/all/rain.svg'),
	'fog': require('@bybas/weather-icons/production/fill/all/fog.svg'),
	'wind': require('@bybas/weather-icons/production/fill/all/wind.svg'),
	'cloudy': require('@bybas/weather-icons/production/fill/all/cloudy.svg'),
	'partly-cloudy-day': require('@bybas/weather-icons/production/fill/all/partly-cloudy-day.svg'),
	'partly-cloudy-night': require('@bybas/weather-icons/production/fill/all/partly-cloudy-night.svg'),
	'clear-day': require('@bybas/weather-icons/production/fill/all/clear-day.svg'),
	'clear-night': require('@bybas/weather-icons/production/fill/all/clear-night.svg'),

	// === iconSet=icons2 (extended) ===
	'snow-showers-day': require('@bybas/weather-icons/production/fill/all/partly-cloudy-day-snow.svg'),
	'snow-showers-night': require('@bybas/weather-icons/production/fill/all/partly-cloudy-night-snow.svg'),
	'thunder-rain': require('@bybas/weather-icons/production/fill/all/thunderstorms-rain.svg'),
	'thunder-showers-day': require('@bybas/weather-icons/production/fill/all/thunderstorms-day-rain.svg'),
	'thunder-showers-night': require('@bybas/weather-icons/production/fill/all/thunderstorms-night-rain.svg'),
	'showers-day': require('@bybas/weather-icons/production/fill/all/partly-cloudy-day-rain.svg'),
	'showers-night': require('@bybas/weather-icons/production/fill/all/partly-cloudy-night-rain.svg'),

	// === Other Info Icons ===
	'feelslike': require('@bybas/weather-icons/production/fill/all/thermometer.svg'),
	'humidity': require('@bybas/weather-icons/production/fill/all/humidity.svg'),
	'pressure': require('@bybas/weather-icons/production/fill/all/barometer.svg'),

	// UV Index (multiple variations: default + 1-11)
	'uvindex': {
		0: require('@bybas/weather-icons/production/fill/all/uv-index.svg'),
		1: require('@bybas/weather-icons/production/fill/all/uv-index-1.svg'),
		2: require('@bybas/weather-icons/production/fill/all/uv-index-2.svg'),
		3: require('@bybas/weather-icons/production/fill/all/uv-index-3.svg'),
		4: require('@bybas/weather-icons/production/fill/all/uv-index-4.svg'),
		5: require('@bybas/weather-icons/production/fill/all/uv-index-5.svg'),
		6: require('@bybas/weather-icons/production/fill/all/uv-index-6.svg'),
		7: require('@bybas/weather-icons/production/fill/all/uv-index-7.svg'),
		8: require('@bybas/weather-icons/production/fill/all/uv-index-8.svg'),
		9: require('@bybas/weather-icons/production/fill/all/uv-index-9.svg'),
		10: require('@bybas/weather-icons/production/fill/all/uv-index-10.svg'),
		11: require('@bybas/weather-icons/production/fill/all/uv-index-11.svg'),
	},

	// Wind Speed - Beaufort Scale (multiple variations: default + 0-12)
	'windspeed': {
		0: require('@bybas/weather-icons/production/fill/all/wind-beaufort-0.svg'),
		1: require('@bybas/weather-icons/production/fill/all/wind-beaufort-1.svg'),
		2: require('@bybas/weather-icons/production/fill/all/wind-beaufort-2.svg'),
		3: require('@bybas/weather-icons/production/fill/all/wind-beaufort-3.svg'),
		4: require('@bybas/weather-icons/production/fill/all/wind-beaufort-4.svg'),
		5: require('@bybas/weather-icons/production/fill/all/wind-beaufort-5.svg'),
		6: require('@bybas/weather-icons/production/fill/all/wind-beaufort-6.svg'),
		7: require('@bybas/weather-icons/production/fill/all/wind-beaufort-7.svg'),
		8: require('@bybas/weather-icons/production/fill/all/wind-beaufort-8.svg'),
		9: require('@bybas/weather-icons/production/fill/all/wind-beaufort-9.svg'),
		10: require('@bybas/weather-icons/production/fill/all/wind-beaufort-10.svg'),
		11: require('@bybas/weather-icons/production/fill/all/wind-beaufort-11.svg'),
		12: require('@bybas/weather-icons/production/fill/all/wind-beaufort-12.svg'),
	},
};

export default weatherIconMap;
