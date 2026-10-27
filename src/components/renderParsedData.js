import weatherIconMap from './weatherIconMap.js';

class renderWeatherData {
	constructor(parsedWeatherData, location, isFavorite = false) {
		this.parsedWeatherData = parsedWeatherData;
		this.location = location;
		this.isFavorite = isFavorite;
	}

	render() {
		this.renderCurrentWeather();
		this.renderDailyWeather();
		this.renderHourlyWeather();
		this.renderCurrentOtherInfo();
	}

	formatDateTime(epochTime) {
		const date = new Date(epochTime * 1000);

		return {
			weekday: date.toLocaleDateString('en-US', { weekday: 'long' }),
			time: date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			}),
			date: date.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
			}),
		};
	}

	renderCurrentWeather() {
		const currentWeather = this.parsedWeatherData.getCurrentWeather();
		const currentDayWeather = this.parsedWeatherData.getDailyWeather()[0];

		console.log('Current Weather:', currentWeather);

		const currentWeatherContainer =
			document.getElementsByClassName('current-info')[0];
		currentWeatherContainer.innerHTML = `
			<div class="flex flex-col ml-5 gap-1">
				<div class="flex items-center gap-3">
					<div class="city-name text-4xl font-bold">${this.location.charAt(0).toUpperCase() + this.location.slice(1)}</div>
					<button id="favorite-btn" data-city="${this.location}" class="p-1.5 rounded-full text-2xl hover:bg-surface-2 transition flex items-center justify-center text-[var(--color-accent-warm)] cursor-pointer" title="${this.isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
						<i class="ti ${this.isFavorite ? 'ti-star-filled' : 'ti-star'}"></i>
					</button>
				</div>

				<div class="time-day flex text-xl text-text-3 gap-3">
					<div class="weekday">${this.formatDateTime(currentWeather.datetimeEpoch).weekday},</div>
					<div class="current-time">${this.formatDateTime(currentWeather.datetimeEpoch).time}</div>
				</div>
			</div>

			<div class="flex mr-5 flex-col gap-0">
				<div class="flex gap-4 items-center ">
					<div class="weather-icon"><img src="${weatherIconMap[currentWeather.icon]}" alt="" height="70" width="70" /></div>
					<div class="temp text-5xl font-bold">${currentWeather.temp}°C</div>

					<div class="small-text flex flex-col text-text-3">
						<div class="high">High ${currentDayWeather.tempmax}°C</div>
						<div class="low">Low ${currentDayWeather.tempmin}°C</div>
					</div>
				</div>
				<div class="self-end text-xl text-text-3">
					<div class="weather-type">${currentWeather.conditions}</div>
				</div>
			</div>
		`;
	}

	renderDailyWeather() {
		const dailyWeather = this.parsedWeatherData.getDailyWeather();
		console.log('Daily Weather:', dailyWeather);

		const dailyWeatherContainer =
			document.getElementsByClassName('weekday-container')[0];

		dailyWeatherContainer.innerHTML = dailyWeather.slice(0, 7)
			.map(
				(day) => `
					<div class="grid grid-cols-[1fr_1fr_1fr] items-center">
						<div class="day-name font-bold">${this.formatDateTime(day.datetimeEpoch).weekday}</div>
						<div class="weather-icon justify-self-center"><img src="${weatherIconMap[day.icon]}" alt="" height="50" width="50" /></div>
						<div class="temp flex gap-2 justify-self-end">
							<div class="high font-bold text-lg w-8 text-right">${day.tempmax}°</div>
							<div class="low text-text-3 w-10 text-right">${day.tempmin}°</div>
						</div>
					</div>
			`
			)
			.join('');
	}

	renderHourlyWeather() {
		const hourlyWeather = this.parsedWeatherData.getHourlyWeather();
		console.log('Hourly Weather:', hourlyWeather);
		const hourlyWeatherContainer =
			document.getElementsByClassName('hourly-container')[0];
		const hourlyWeatherFuture = hourlyWeather.filter((hour) => hour.datetimeEpoch > Date.now() / 1000).slice(0, 12);

		hourlyWeatherContainer.innerHTML = hourlyWeatherFuture
			.map(
				(hour) => {
					return `
						<div class="flex flex-col items-center shrink-0 pl-6 pr-6 mt-6 mb-6">
							<div class="time font-bold text-text-3">${this.formatDateTime(hour.datetimeEpoch).time}</div>
							<div class="weather-icon"><img src="${weatherIconMap[hour.icon]}" alt="" height="50" width="50" /></div>
							<div class="temp text-xl font-bold">${hour.temp}°</div>
						</div>`
				}
			)
			.join('');
	}

	getUvIndexIcon(uvValue) {
		const key = Math.max(0, Math.min(12, Math.round(uvValue)));
		return weatherIconMap['uvindex'][key];
	}

	getWindSpeedIcon(windSpeed) {
		const key = Math.max(1, Math.min(12, Math.round(windSpeed)));
		return weatherIconMap['windspeed'][key];
	}

	renderCurrentOtherInfo() {
		const currentWeather = this.parsedWeatherData.getCurrentWeather();
		const currentWeatherContainer = document.getElementsByClassName('other-info')[0];
		/*
		feelslike: -8.9
		humidity: 81.7
		pressure: 1037
		uvindex: 2
		windspeed: 10.8
		*/
		currentWeatherContainer.innerHTML = `
			<div class="grid grid-cols-3  gap-6">
				<div class="flex flex-col gap-2  items-center bg-surface p-4 rounded-xl">
					<div class="flex gap-2 items-center"> 
						<img src="${weatherIconMap['feelslike']}" alt="" height="50" width="50" />
						<div class="text-text-3 text-xl"> Feels like </div>
					</div>
					<div class="font-bold text-3xl"> ${currentWeather.feelslike}°C</div>
				</div>
				<div class="flex flex-col gap-2  items-center bg-surface p-4 rounded-xl">
					<div class="flex gap-2 items-center"> 
						<img src="${weatherIconMap['humidity']}" alt="" height="50" width="50" />
						<div class="text-text-3 text-xl"> Humidity </div>
					</div>
					<div class="font-bold text-3xl"> ${currentWeather.humidity}%</div>
				</div>
				<div class="flex flex-col gap-2  items-center bg-surface p-4 rounded-xl">
					<div class="flex gap-2 items-center"> 
						<img src="${weatherIconMap['pressure']}" alt="" height="50" width="50" />
						<div class="text-text-3 text-xl"> Pressure </div>
					</div>
					<div class="font-bold text-3xl"> ${currentWeather.pressure} hPa</div>
				</div>
				<div class="flex flex-col gap-2  items-center bg-surface p-4 rounded-xl">
					<div> 
						<img src="${this.getUvIndexIcon(currentWeather.uvindex)}" alt="" height="50" width="50" />
						<div class="text-text-3 text-xl"> UV Index </div>
					</div>
					<div class="font-bold text-3xl"> ${currentWeather.uvindex}</div>
				</div>
				<div class="flex flex-col gap-2  items-center bg-surface p-4 rounded-xl">
					<div> 
						<img src="${this.getWindSpeedIcon(currentWeather.windspeed)}" alt="" height="50" width="50" />
						<div class="text-text-3 text-xl"> Wind Speed </div>
					</div>
					<div class="font-bold text-3xl"> ${currentWeather.windspeed} km/h</div>
				</div>
			</div>
		`;
	}

}

export default renderWeatherData;