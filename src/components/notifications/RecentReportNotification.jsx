import React from 'react';
import { FaUser, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import './NotificationCard.css';

const RecentReportNotification = ({ report }) => {
  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      const date = dateString.toDate ? dateString.toDate() : new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  };

  const imageSrc = report.imagenUrl || report.foto || report.image || report.photoURL || null;

  return (
    <div className="notification-card">
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={report.titulo || 'Imagen del reporte'} 
          className="notification-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/120x100?text=Sin+imagen';
          }}
        />
      ) : (
        <div className="notification-image" style={{
          background: '#f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: 11,
          textAlign: 'center',
          padding: 4
        }}>
          Sin imagen
        </div>
      )}
      
      <div className="notification-content">
        <div>
          <div className="notification-header">
            <h3 className="notification-title">
              {report.tipoReporte || 'Reporte'}
            </h3>
            <span className="notification-badge badge-new">
              Nuevo
            </span>
          </div>
          
          <div className="notification-meta">
            <div className="notification-user">
              <FaUser size={12} />
              <span>{report.userEmail || 'Usuario desconocido'}</span>
            </div>
            <div className="notification-date">
              <FaCalendarAlt size={10} />
              <span>{formatDate(report.fechaRegistro || report.fechaHora)}</span>
            </div>
          </div>
          
          <p className="notification-description">
            {report.descripcion || 'Sin descripción disponible'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RecentReportNotification;
