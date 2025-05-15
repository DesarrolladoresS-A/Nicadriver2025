import React, { useEffect, useState, useCallback } from 'react';
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  InfoWindow
} from '@react-google-maps/api';
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../database/firebaseconfig';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const libraries = ['places']; // <-- evitar que se re-cargue

const containerStyle = {
  width: '150%',
  height: '600px'
};

const center = {
  lat: 12.1364,
  lng: -86.2514
};

const getIconUrl = (tipo) => {
  if (!tipo || typeof tipo !== 'string') {
    return 'https://img.icons8.com/color/48/marker.png';
  }

  const lowerTipo = tipo.toLowerCase();

  switch (lowerTipo) {
    case 'accidente':
      return 'https://img.icons8.com/color/48/car-crash.png';
    case 'tráfico':
    case 'trafico':
      return 'https://img.icons8.com/color/48/traffic-jam.png';
    case 'emergencia':
      return 'https://img.icons8.com/color/48/ambulance.png';
    case 'policía':
    case 'policia':
      return 'https://img.icons8.com/color/48/policeman-male.png';
    default:
      return 'https://img.icons8.com/color/48/marker.png';
  }
};

const EstadodeTrafico = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries
  });

  const [map, setMap] = useState(null);
  const [incidentes, setIncidentes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagen, setImagen] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'incidentes'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidentes(data);
    };

    fetchData();
  }, []);

  const onMapClick = useCallback((event) => {
    setSelected({
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  }, []);

  const handleImagenChange = (e) => {
    if (e.target.files[0]) {
      setImagen(e.target.files[0]);
    }
  };

  const handleReporte = async () => {
    if (!selected || !tipo || !descripcion) {
      alert('Completa todos los campos.');
      return;
    }

    try {
      let urlImagen = '';
      if (imagen) {
        const storage = getStorage();
        const storageRef = ref(storage, `incidentes/${selected.lat}_${selected.lng}.jpg`);
        await uploadBytes(storageRef, imagen);
        urlImagen = await getDownloadURL(storageRef);
      }

      const docRef = await addDoc(collection(db, 'incidentes'), {
        descripcion,
        tipo,
        lat: selected.lat,
        lng: selected.lng,
        imagen: urlImagen,
        timestamp: serverTimestamp()
      });

      setIncidentes(prev => [
        ...prev,
        { id: docRef.id, descripcion, tipo, lat: selected.lat, lng: selected.lng, imagen: urlImagen }
      ]);

      setDescripcion('');
      setTipo('');
      setImagen(null);
      setSelected(null);
      alert('Reporte enviado correctamente.');
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      alert('Error al guardar el reporte.');
    }
  };

  if (!isLoaded) return <div>Cargando mapa...</div>;

  return (
    <div>
      <h2>Estado de Tráfico</h2>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={map => setMap(map)}
        onClick={onMapClick}
        options={{ mapTypeId: 'satellite', streetViewControl: false }}
      >
        {incidentes.map((incidente, index) => (
          <Marker
            key={index}
            position={{ lat: incidente.lat, lng: incidente.lng }}
            icon={{
              url: getIconUrl(incidente.tipo),
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            onClick={() => setSelected(incidente)}
          />
        ))}

        {selected && !selected.id && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ maxWidth: '250px' }}>
              <h3>Reportar Incidente</h3>
              <select value={tipo} onChange={e => setTipo(e.target.value)}>
                <option value="">Seleccionar tipo</option>
                <option value="accidente">Accidente</option>
                <option value="tráfico">Tráfico</option>
                <option value="emergencia">Emergencia</option>
                <option value="policía">Policía</option>
              </select>
              <br />
              <textarea
                placeholder="Descripción del incidente"
                value={descripcion}
                onChange={e => setDescripcion(e.target.value)}
              />
              <br />
              <input type="file" onChange={handleImagenChange} />
              <br />
              <button onClick={handleReporte}>Enviar</button>
            </div>
          </InfoWindow>
        )}

        {selected && selected.id && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div>
              <h4>{selected.tipo}</h4>
              <p>{selected.descripcion}</p>
              {selected.imagen && <img src={selected.imagen} alt="Incidente" style={{ width: '100%' }} />}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
};

export default EstadodeTrafico;
