export async function getWeatherResponse(query) {
    const apiKey = "9a92d65cd99fd664bb91bb5f1dea1361";
    const text = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita tildes

    // Detecta si el usuario pide su ubicación actual
    if (
        text.includes("mi ubicacion") ||
        text.includes("mi localizacion") ||
        text.includes("donde estoy")
    ) {
        try {
        const pos = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej)
        );
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=es&appid=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        return `📍 Estás en ${data.name}. La temperatura actual es de ${data.main.temp}°C con ${data.weather[0].description}.`;
        } catch {
        return "No pude acceder a tu ubicación 😕. Activa el GPS o indícame una ciudad.";
        }
    }

    // Detecta si el usuario menciona una ciudad (en, de, para, por)
    const regex = /\b(?:en|de|para|por|del|sobre)\s+([a-zA-Záéíóúñ\s]+)/i;
    const match = query.match(regex);
    let location = match ? match[1].trim() : null;

    if (location) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&lang=es&appid=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return "😔 No encontré esa ubicación. Intenta con otra ciudad o país.";
        const data = await res.json();

        // Mensaje adaptable al tipo de consulta
        let desc = data.weather[0].description;
        let temp = data.main.temp;
        return `🌤️ En ${data.name}: ${temp}°C, ${desc}.`;
    }

    // Si no se reconoce la intención
    return "Puedo darte el pronóstico si me dices una ciudad o tu ubicación. Por ejemplo: 'Indícame el clima en Managua' o 'Pronóstico según mi ubicación'.";
}
