import React from 'react';
import { FaUser, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import './NotificationCard.css';

const ReportStatusNotification = ({ report }) => {
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

  // Get status display info
  const getStatusInfo = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobado':
      case 'aceptado':
        return {
          text: 'Aceptado',
          className: 'status-approved',
          icon: <FaCheckCircle />
        };
      case 'rechazado':
        return {
          text: 'Rechazado',
          className: 'status-rejected',
          icon: <FaTimesCircle />
        };
      default:
        return {
          text: 'En proceso',
          className: 'status-pending',
          icon: <FaClock />
        };
    }
  };

  const statusInfo = getStatusInfo(report.estado);
  const updateDate = report.fechaActualizacion || report.fechaRegistro || report.fechaHora;
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
              {report.tipoReporte || 'Actualización de Reporte'}
            </h3>
            <span className={`notification-badge ${statusInfo.className}`}>
              {statusInfo.text}
            </span>
          </div>
          
          <div className="notification-meta">
            <div className="notification-user">
              <FaUser size={12} />
              <span>{report.userEmail || 'Usuario desconocido'}</span>
            </div>
            <div className="notification-date">
              <FaCalendarAlt size={10} />
              <span>{formatDate(updateDate)}</span>
            </div>
          </div>
          
          <p className="notification-description">
            {report.descripcion || 'Sin descripción disponible'}
          </p>
          
          <div className={`notification-status ${statusInfo.className}`}>
            {statusInfo.icon}
            <span>Su reporte ha sido {statusInfo.text.toLowerCase()}</span>
          </div>
          
          {report.comentarioAdmin && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: '#555' }}>
              <strong>Comentario del administrador:</strong>
              <p style={{ margin: '4px 0 0', color: '#333' }}>{report.comentarioAdmin}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportStatusNotification;
