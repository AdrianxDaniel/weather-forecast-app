const userFormEl = document.querySelector("#userForm");
const cityInputEl = document.querySelector("#city");
const cityButtonsEl = document.querySelector("#cityButtons");
const todayContainerEl = document.querySelector("#daysWeather");
const forecastContainerEl = document.querySelector("#forecastReports");
const citySearchEl = document.querySelector("#searchedCity");
const searchHistoryEl = document.querySelector("#searchedHistory");

let searchHistory = JSON.parse(localStorage.getItem("search")) || [];

const renderSearchHistory = () => {
  searchHistoryEl.innerHTML = "";
  searchHistory.forEach((city) => {
    const historyItem = document.createElement("div");
    historyItem.textContent = city;
    historyItem.classList.add("card-body");
    searchHistoryEl.appendChild(historyItem);
  });
};

renderSearchHistory();

document.getElementById("weather-section").style.display = "none";
document.getElementById("search-history-section").style.display = "none";

const showWeatherSection = function () {
  document.getElementById("weather-section").style.display = "block";
  document.getElementById("search-history-section").style.display = "block";
};

const formSubmitHandler = function (event) {
  event.preventDefault();

  const city = cityInputEl.value.trim();

  if (city) {
    getCityForecast(city);

    forecastContainerEl.innerHTML = "";
    cityInputEl.value = "";
    searchHistory.push(city);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
  } else {
    alert("Please enter a City Name");
  }
};

const buttonClickHandler = function (event) {
  const city = event.target.getAttribute("city");
  if (city) {
    getCityForecast(city);
    forecastContainerEl.innerHTML = "";
    searchHistory.push(city);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderSearchHistory();
  }
};

const getCityForecast = function (city) {
  const weatherAppAPIKey = "169dac2caf447e6cb30e5994700f8bf1";
  const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${weatherAppAPIKey}`;

  fetch(apiUrl)
    .then(function (response) {
      if (response.ok) return response.json();
      else {
        alert(`Error:${response.statusText}`);
      }
    })
    .then(function (geoData) {
      console.log("--------- First request with geolocation --------");
      console.log(geoData);

      const latitude = geoData[0].lat;
      const longitude = geoData[0].lon;
      console.log(latitude, longitude);

      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=imperial&appid=${weatherAppAPIKey}`;
      fetch(forecastUrl)
        .then(function (response2) {
          return response2.json();
        })
        .then(function (forecastData) {
          console.log("--------- Second request with forecast --------");
          console.log(forecastData);
          displayWeather(forecastData.list, city);
        });
    })
    .catch(function (error) {
      alert("Unable to connect to Weather API");
    });
};

const createTodayWeatherCard = function (today) {
  const todayWeatherCard = document.createElement("div");
  todayWeatherCard.classList.add("card", "today-weather-card");

  const todayDate = dayjs().format("M/D/YYYY");
  const todayWeatherIconUrl = `https://openweathermap.org/img/w/${today.weather[0].icon}.png`;

  const todayCardHeader = document.createElement("h2");
  todayCardHeader.classList.add("today-card-header", "h2");
  todayCardHeader.innerHTML = `Today,<br>${todayDate}`;

  const todayCardBody = document.createElement("div");
  todayCardBody.classList.add("today-card-body");

  const todayCardIcon = document.createElement("img");
  todayCardIcon.setAttribute("src", todayWeatherIconUrl);
  todayCardIcon.textContent = `Weather: ${todayCardIcon}`;

  const todayCardTemp = document.createElement("p");
  todayCardTemp.classList.add("card-text");
  todayCardTemp.textContent = `Temperature: ${today.main.temp}°F`;

  const todayCardWind = document.createElement("p");
  todayCardWind.classList.add("card-text");
  todayCardWind.textContent = `Wind: ${today.wind.speed} mph`;

  const todayCardHum = document.createElement("p");
  todayCardHum.classList.add("card-text");
  todayCardHum.textContent = `Humidity: ${today.main.humidity}%`;

  todayCardBody.append(
    todayCardIcon,
    todayCardTemp,
    todayCardWind,
    todayCardHum
  );
  todayWeatherCard.append(todayCardHeader, todayCardBody);

  return todayWeatherCard;
};

const createForecastCard = function (forecastData) {
  const weatherIconUrl = `https://openweathermap.org/img/w/${forecastData.weather[0].icon}.png`;

  const forecastCard = document.createElement("div");
  forecastCard.classList.add("card", "task-card");

  const cardHeader = document.createElement("div");
  cardHeader.classList.add("card-header", "h4");
  cardHeader.textContent = dayjs(forecastData.dt_txt).format("M/D/YYYY");

  const cardBody = document.createElement("div");
  cardBody.classList.add("card-body");

  const cardIcon = document.createElement("img");
  cardIcon.setAttribute("src", weatherIconUrl);
  cardIcon.textContent = `Weather: ${cardIcon}`;

  const cardTemp = document.createElement("p");
  cardTemp.classList.add("card-text");
  cardTemp.textContent = `Temperature: ${forecastData.main.temp}°F`;

  const cardWind = document.createElement("p");
  cardWind.classList.add("card-text");
  cardWind.textContent = `Wind: ${forecastData.wind.speed} mph`;

  const cardHum = document.createElement("p");
  cardHum.classList.add("card-text");
  cardHum.textContent = `Humidity: ${forecastData.main.humidity}%`;

  cardBody.append(cardIcon, cardTemp, cardWind, cardHum);
  forecastCard.append(cardHeader, cardBody);

  return forecastCard;
};

const displayWeather = function (forecast, searchTerm) {
  if (forecast.length === 0) {
    forecastContainerEl.textContent = "No forecast found.";
    return;
  }

  citySearchEl.textContent = searchTerm;

  const todayWeather = forecast[0];
  const todayWeatherCard = createTodayWeatherCard(todayWeather);
  document.getElementById("daysWeather").innerHTML = "";
  document.getElementById("daysWeather").appendChild(todayWeatherCard);

  const forecastRowContainer = document.createElement("div");
  forecastRowContainer.classList.add("forecast-row");

  for (let i = 8; i < 40; i += 8) {
    const forecastCard = createForecastCard(forecast[i]);
    forecastRowContainer.appendChild(forecastCard);
  }

  forecastContainerEl.innerHTML = "";
  forecastContainerEl.appendChild(forecastRowContainer);

  showWeatherSection();
};

userFormEl.addEventListener("submit", formSubmitHandler);
cityButtonsEl.addEventListener("click", buttonClickHandler);
