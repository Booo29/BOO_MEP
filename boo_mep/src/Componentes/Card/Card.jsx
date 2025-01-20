// En src/componentes/TallerCard.js
import React from 'react';
import PropTypes from 'prop-types';
import './Card.css';

const TallerCard = ({ nombre, descripcion, tutor, imagen, color, onClick }) => {

  const cardStyle = {
    backgroundColor: color || '#ffffff', 
  };

  return (
    <div className="taller-card" style={cardStyle} onClick={onClick}>
      <h2>{nombre}</h2>
      {imagen && <img src={imagen} alt={nombre} className="taller-image" />}
      <p className="descripcion" >{descripcion}</p>
      {tutor && <p className="tutor">Tutor: {tutor}</p>}
    </div>
  );
};

TallerCard.propTypes = {
  nombre: PropTypes.string,
  descripcion: PropTypes.string,
  tutor: PropTypes.string,
  imagen: PropTypes.string, 
  color: PropTypes.string, 
  onClick: PropTypes.func, 
};

export default TallerCard;
