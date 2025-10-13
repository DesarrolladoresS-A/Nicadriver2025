export async function getWeatherResponse(query) {
  const apiKey = "9a92d65cd99fd664bb91bb5f1dea1361"; // API de OpenWeather
    const regex = /en\s+([a-zA-Záéíóúñ\s]+)/i;
    const match = query.match(regex);
    let location = match ? match[1].trim() : null;

    if (query.toLowerCase().includes("mi ubicación")) {
        try {
        const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej)
        );
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const url = `https://api.openweathermap.org/data/3.0/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        return `📍 Estás en ${data.name}. La temperatura actual es de ${data.main.temp}°C con ${data.weather[0].description}.`;
        } catch {
        return "No pude acceder a tu ubicación 😕. Activa el GPS o indica una ciudad.";
        }
    }

    if (location) {
        const url = `https://api.openweathermap.org/data/3.0/weather?q=${location}&units=metric&lang=es&appid=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return "No encontré esa ubicación 😔. Verifica el nombre.";
        const data = await res.json();
        return `🌤️ En ${data.name}: ${data.main.temp}°C, ${data.weather[0].description}.`;
    }

    return "Puedo indicarte el clima si me dices una ubicación, por ejemplo: 'Clima en León' o 'Pronóstico según mi ubicación'.";
}
