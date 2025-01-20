import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "primereact/button";
import "./Institucion.css";
import useStore from "../../store/store"


const InstitucionCard = ({ institucion, onDelete}) => {

     const navigate = useNavigate();
    
    const setInstitutionId = useStore((state) => state.setInstitutionId);

    const handleEdit = () => {
        setInstitutionId(institucion.Inst_Id);
        navigate('/StepsFormPage');
    }

    return (
        <div className="card">
            <h2>{institucion.Inst_Nombre}</h2>
            <p><strong>Tipo:</strong> {institucion.Inst_Tipo}</p>
            <p><strong>Dirección Regional:</strong> {institucion.Inst_DireccionRegional}</p>
            <p><strong>Circuito:</strong> {institucion.Inst_Circuito}</p>
            <p><strong>Materias:</strong> {institucion.Materias}</p>
            <div className="card-actions">
                <Button label="Ingresar" icon="pi pi-calendar" className="p-button-primary" severity="success"  />
                <Button label="Editar" icon="pi pi-pencil" className="p-button-warning" severity="info" onClick={handleEdit}/>
                <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" severity="danger" onClick={onDelete} />
            </div>

        </div>
    );
};

export default InstitucionCard;
