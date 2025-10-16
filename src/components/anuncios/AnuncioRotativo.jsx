import React, { useState, useEffect } from "react";
import "../../styles/Anuncio.css";

// Importa las imágenes locales
import anuncio1 from "./imagenes/cocacola.png";
import anuncio2 from "./imagenes/helados.jpg";
import anuncio3 from "./imagenes/sabritas.jpg";
import anuncio4 from "./imagenes/eskimo.jpg";
import anuncio5 from "./imagenes/tacos.png";
import anuncio6 from "./imagenes/snic.jpg";
import anuncio7 from "./imagenes/mc.jpg";
import anuncio8 from "./imagenes/yupi.jpg";
import anuncio9 from "./imagenes/cocacola2.png";
import anuncio10 from "./imagenes/pantene.jpg";
import anuncio11 from "./imagenes/pantene2.jpg";

const anunciosData = [
    {
        id: 1,
        imagen: anuncio1,
        texto: "Destapa la felicidad con Coca-Cola",
        enlace: "https://sitio.com/promo1",
    },
    {
        id: 2,
        imagen: anuncio2,
        texto: "Disfruta el sol… ¡con un helado en la mano!",
        enlace: "https://sitio.com/promo2",
    },
    {
        id: 3,
        imagen: anuncio3,
        texto: "¡A que no puedes comer solo una!",
        enlace: "https://sitio.com/promo3",
    },
    {
        id: 4,
        imagen: anuncio4,
        texto: "Eskimo, el sabor que nos acompaña desde siempre.",
        enlace: "https://sitio.com/promo4",
    },
    {
        id: 5,
        imagen: anuncio5,
        texto: "Taco que se respeta… se come con las manos.",
        enlace: "https://sitio.com/promo5",
    },
    {
        id: 6,
        imagen: anuncio6,
        texto: "¿Tienes hambre? Come un Snickers.",
        enlace: "https://sitio.com/promo6",
    },
    {
        id: 7,
        imagen: anuncio7,
        texto: "Disfruta cada mordida, comparte cada momento.",
        enlace: "https://sitio.com/promo7",
    },
    {
        id: 8,
        imagen: anuncio8,
        texto: "Llena tu día de color y sabor con Yupi.",
        enlace: "https://sitio.com/promo8",
    },
    {
        id: 9,
        imagen: anuncio9,
        texto: "Refresca tu momento con Coca-Cola.",
        enlace: "https://sitio.com/promo9",
    },
        {
        id: 10,
        imagen: anuncio10,
        texto: "Fuerza y brillo que se sienten.",
        enlace: "https://sitio.com/promo10",
    },
        {
        id: 11,
        imagen: anuncio11,
        texto: "Cabello saludable desde la raíz hasta las puntas.",
        enlace: "https://sitio.com/promo11",
    },
    ];

    const AnuncioRotativo = ({ intervalo = 5000 }) => {
    const [indice, setIndice] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
        setIndice((prev) => (prev + 1) % anunciosData.length);
        }, intervalo);
        return () => clearInterval(timer);
    }, [intervalo]);

    const anuncioActual = anunciosData[indice];

    return (
        <div className="anuncio-container">
        <a href={anuncioActual.enlace} target="_blank" rel="noopener noreferrer">
            <img
            src={anuncioActual.imagen}
            alt={`Anuncio ${anuncioActual.id}`}
            className="anuncio-imagen"
            />
        </a>
        <p className="anuncio-texto">{anuncioActual.texto}</p>
        </div>
    );
};

export default AnuncioRotativo;
