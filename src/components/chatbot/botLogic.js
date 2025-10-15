import { getGeminiResponse } from "./geminiLogic";

export async function getWeatherResponse(query) {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY; // 🔑 OpenWeather
    const text = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Palabras clave que activan pronóstico
    const climaKeywords = [
        "clima", "pronóstico", "temperatura", "llueve", "lluvia", "soleado",
        "nublado", "mi ubicación", "mi localización", "donde estoy"
    ];

    // Si contiene palabras sobre clima → usa OpenWeather
    if (climaKeywords.some((k) => text.includes(k))) {
        try {
        // 🔹 Usuario pide clima según ubicación
        if (text.includes("mi ubicacion") || text.includes("mi localizacion") || text.includes("donde estoy")) {
            const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej)
            );
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
            const res = await fetch(url);
            const data = await res.json();
            return `📍 Estás en ${data.name}. La temperatura actual es de ${data.main.temp}°C con ${data.weather[0].description}.`;
        }

        // 🔹 Usuario menciona una ciudad
        const regex = /\b(?:en|de|para|por|del|sobre)\s+([a-zA-Záéíóúñ\s]+)/i;
        const match = query.match(regex);
        const location = match ? match[1].trim() : null;

        if (location) {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=es&appid=${apiKey}`;
            const res = await fetch(url);
            if (!res.ok) return "😔 No encontré esa ubicación. Intenta con otra ciudad.";
            const data = await res.json();
            return `🌤️ En ${data.name}: ${data.main.temp}°C, ${data.weather[0].description}.`;
        }
        } catch {
        return "No pude acceder a tu ubicación 😕. Activa el GPS o indícame una ciudad.";
        }
    }

    // 🔹 Si no es de clima → usa Gemini
    const geminiAnswer = await getGeminiResponse(query);
    return geminiAnswer;
}
