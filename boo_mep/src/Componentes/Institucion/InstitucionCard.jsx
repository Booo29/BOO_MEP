import React from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "primereact/button";
import "./Institucion.css";
import useStore from "../../store/store"


const InstitucionCard = ({ institucion, onDelete, onEdit}) => {

     const navigate = useNavigate();
    
    const setInstitutionId = useStore((state) => state.setInstitutionId);

    const handleAddCiclo = () => {
        setInstitutionId(institucion.Inst_Id);
        navigate('/StepsFormPage');
    }

    return (
        <div className="card">
            <h2>{institucion.Inst_Nombre}</h2>
            <p><strong>Tipo:</strong> {institucion.Inst_Tipo}</p>
            <p><strong>Dirección Regional:</strong> {institucion.Inst_DireccionRegional}</p>
            <p><strong>Circuito:</strong> {institucion.Inst_Circuito}</p>
            <div className="card-actions">
                <Button label="Ingresar" icon="pi pi-calendar" className="p-button-primary" severity="success"  />
                <Button label="Editar Institución" icon="pi pi-pencil" className="p-button-info" severity="info" onClick={onEdit} />
                <Button label="Ingresar Ciclo" icon="pi pi-calendar" className="p-button-help" severity="help" onClick={handleAddCiclo} />
                <Button label="Ciclos anteriores" icon="pi pi-calendar" className="p-button-warning" severity="warning" />
                <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" severity="danger" onClick={onDelete} />
            </div>

        </div>
    );
};

export default InstitucionCard;
