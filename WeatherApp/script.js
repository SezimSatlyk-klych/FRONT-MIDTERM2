const API_KEY = '6f13411ee33f84737fabe38e37dc944f';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
let isCelsius = true;

const searchInput = document.getElementById('city-search');
const suggestionsList = document.getElementById('search-suggestions');
const unitToggle = document.getElementById('unit-toggle');
const cityName = document.getElementById('city-name');
const currentTemp = document.getElementById('current-temp');
const currentDesc = document.getElementById('current-desc');
const currentHumidity = document.getElementById('current-humidity');
const currentWind = document.getElementById('current-wind');
const currentIcon = document.getElementById('current-icon');
const forecastCards = document.getElementById('forecast-cards');


searchInput.addEventListener('input', async () => {
  const query = searchInput.value;
  if (query.length < 3) return;

  const response = await fetch(`${BASE_URL}find?q=${query}&appid=${API_KEY}`);
  const data = await response.json();

  suggestionsList.innerHTML = '';
  data.list.forEach(city => {
    const li = document.createElement('li');
    li.textContent = city.name;
    li.addEventListener('click', () => fetchWeather(city.name));
    suggestionsList.appendChild(li);
  });
});


async function fetchWeather(city) {
  const unit = isCelsius ? 'metric' : 'imperial';


  const weatherResponse = await fetch(`${BASE_URL}weather?q=${city}&units=${unit}&appid=${API_KEY}`);
  const weatherData = await weatherResponse.json();

 
  cityName.textContent = weatherData.name;
  currentTemp.textContent = `Temperature: ${weatherData.main.temp}°${isCelsius ? 'C' : 'F'}`;
  currentDesc.textContent = `Condition: ${weatherData.weather[0].description}`;
  currentHumidity.textContent = `Humidity: ${weatherData.main.humidity}%`;
  currentWind.textContent = `Wind Speed: ${weatherData.wind.speed} ${isCelsius ? 'km/h' : 'mph'}`;
  currentIcon.src = `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`;

  const forecastResponse = await fetch(`${BASE_URL}forecast?q=${city}&units=${unit}&appid=${API_KEY}`);
  const forecastData = await forecastResponse.json();

  forecastCards.innerHTML = '';
  const dailyData = forecastData.list.filter(item => item.dt_txt.includes('12:00:00'));
  dailyData.forEach(day => {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    card.innerHTML = `
      <p>${new Date(day.dt_txt).toLocaleDateString()}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="Weather Icon" />
      <p>${day.main.temp}°${isCelsius ? 'C' : 'F'}</p>
      <p>${day.weather[0].description}</p>
    `;
    forecastCards.appendChild(card);
  });
}

unitToggle.addEventListener('click', () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? '°C / °F' : '°F / °C';
  if (cityName.textContent !== 'City Name') fetchWeather(cityName.textContent);
});
