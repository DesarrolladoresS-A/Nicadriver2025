import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; // 🔑 IA Gemini

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function getGeminiResponse(prompt) {
    try {
        const response = await model.generateContent(`
    Eres NicaBot, el asistente oficial de la aplicación NicaDriver. 
    Tu función es ayudar al usuario a entender y usar la app correctamente.
    Si el usuario pregunta algo sobre el clima, tráfico o reportes, respóndele 
    de forma clara, en español, No agregues saludos, con tono amable y conciso.

    Pregunta del usuario: ${prompt}
    `);
        return response.response.text();
    } catch (error) {
        console.error("Error en Gemini:", error);
        return "Lo siento 😔, no puedo responder ahora. Intenta más tarde.";
    }
}
