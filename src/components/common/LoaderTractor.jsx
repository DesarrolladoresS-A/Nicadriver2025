import React from 'react';
import '../../styles/LoaderTractor.css';

/**
 * LoaderTractor - Pantalla/Sección de carga con animación de planadora/tractor.
 *
 * Props:
 * - mensaje?: string -> Texto opcional para mostrar debajo del loader.
 * - height?: string | number -> Alto del contenedor (por defecto 260px). Ej: '260px' | 300
 * - className?: string -> Clases adicionales para el contenedor externo.
 * - overlay?: boolean -> Si true, muestra el loader como superposición a pantalla completa.
 */
const LoaderTractor = ({ mensaje = 'Cargando...', height = 260, className = '', overlay = false }) => {
  const styleAltura = typeof height === 'number' ? `${height}px` : height;

  return (
    <div className={`loader-tractor-wrapper ${overlay ? 'overlay' : ''} ${className}`} style={overlay ? undefined : { height: styleAltura }} role="status" aria-live="polite">
      <div className="loader-tractor" aria-label={mensaje}>
        {/* Carretera con líneas amarillas */}
        <div className="carretera" />
        <div className="linea-centro" />

        {/* Meta (bandera) al lado derecho */}
        <div className="meta" aria-hidden="true" />

        <div className="tractor">
          <img src="/imagen/Imagen de Carga.png" alt="Llama cargando" width="100" height="auto" />
        </div>
      </div>
      {mensaje && <p className="loader-tractor-texto">{mensaje}</p>}
    </div>
  );
};

export default LoaderTractor;

