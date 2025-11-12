import React, { useState, useEffect } from "react";
import "./App.css";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [time, setTime] = useState("");
  const apiKey = "43d89dc7f734dd077223af83da81789d";

  const fetchWeather = async (query) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${query}&appid=${apiKey}&units=metric`
      );
      const data = await res.json();
      if (data.cod === 200) {
        setWeather(data);
        updateLocalTime(data);
      } else {
        alert("City not found!");
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const updateLocalTime = (data) => {
    const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const local = new Date(utc + data.timezone * 1000);
    setTime(local.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
  };

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
        );
        const data = await res.json();
        setWeather(data);
        updateLocalTime(data);
      },
      (err) => console.warn("Geolocation denied:", err)
    );
  }, []);

  const getBackgroundClass = () => {
    if (!weather) return "default";
    const condition = weather.weather[0].main.toLowerCase();
    const isDay = weather.weather[0].icon.includes("d");

    if (condition.includes("cloud")) return isDay ? "day-cloudy" : "night-cloudy";
    if (condition.includes("rain")) return isDay ? "day-rainy" : "night-rainy";
    if (condition.includes("mist") || condition.includes("fog"))
      return isDay ? "day-mist" : "night-mist";
    if (isDay) return "day-sunny";
    return "night-clear";
  };

  return (
    <div className={`app ${getBackgroundClass()}`}>
      <div className="overlay"></div>

      <div className="weather-container">
        <h1 className="title">WEATHERY 🌦️</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={() => fetchWeather(city)}>Search</button>
        </div>

        {weather && (
          <div className="weather-info">
            <h2>
              {weather.name}, {weather.sys.country}
            </h2>
            <p className="desc">{weather.weather[0].description}</p>
            <h3 className="temp">{Math.round(weather.main.temp)}°C</h3>
            <p className="time">🕒 {time} (Local time)</p>
          </div>
        )}
      </div>

      <div className="sun"></div>
      <div className="moon"></div>
      <div className="clouds"></div>

      {weather &&
        (weather.weather[0].main.toLowerCase().includes("mist") ||
          weather.weather[0].main.toLowerCase().includes("fog")) && (
          <div className="fog-container">
            <div className="fog"></div>
            <div className="fog delay"></div>
          </div>
        )}
    </div>
  );
};

export default App;
