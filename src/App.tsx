import { useEffect, useState } from 'react';
import './App.css';

const API_KEY = '###############'; // Replace with your WeatherAPI.com API key

interface WeatherData {
  temp: number;
  humidity: number;
  wind: number;
  description: string;
  icon: string;
}

function App() {
  const [city, setCity] = useState('London');
  const [inputCity, setInputCity] = useState('London');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedCity, setLastFetchedCity] = useState<string>('');

  // Fetch weather only if city changes or on interval
  const fetchWeather = async (targetCity: string) => {
    if (!targetCity.trim()) {
      setError('Please enter a city name.');
      setWeather(null);
      return;
    }
    if (targetCity === lastFetchedCity && weather) return; // Prevent duplicate fetch
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${encodeURIComponent(targetCity)}`
      );
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setWeather({
        temp: data.current.temp_c,
        humidity: data.current.humidity,
        wind: data.current.wind_kph,
        description: data.current.condition.text,
        icon: data.current.condition.icon,
      });
      setLastFetchedCity(targetCity);
    } catch (err: any) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(city);
    const interval = setInterval(() => fetchWeather(city), 60000); // Update every 60 seconds
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCity.trim() && inputCity !== city) {
      setCity(inputCity);
      setLastFetchedCity(''); // Force fetch
    }
  };

  return (
    <div className="weather-app">
      <h1>Live Weather Monitor</h1>
  <form onSubmit={handleSearch} style={{ marginBottom: '1em', display: 'flex', gap: '0.5em', flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="text"
          value={inputCity}
          onChange={e => setInputCity(e.target.value)}
          placeholder="Enter city name"
          style={{ padding: '0.5em', fontSize: '1em' }}
        />
        <button type="submit" style={{ padding: '0.5em 1em' }}>
          Search
        </button>
      </form>
      <h2>{city}</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {weather && !loading && !error && (
        <div>
          <img src={weather.icon} alt={weather.description} style={{ verticalAlign: 'middle' }} />
          <p>Temperature: {weather.temp}°C</p>
          <p>Humidity: {weather.humidity}%</p>
          <p>Wind Speed: {weather.wind} kph</p>
          <p>Description: {weather.description}</p>
        </div>
      )}
      <p style={{ fontSize: '0.8em', marginTop: '2em' }}>
        Updates every 60 seconds. Powered by <a href="https://www.weatherapi.com/" title="Free Weather API">WeatherAPI.com</a>.
      </p>
    </div>
  );
}

export default App
