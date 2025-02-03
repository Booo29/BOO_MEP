import React, {useEffect, useState} from "react";
import { useNavigate } from 'react-router-dom';
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import "./Institucion.css";

import useStore from "../../store/store"
import useCicloStore from "../../store/CicloStore";
import usePeriodoStore from "../../store/PeriodoStore";

import { getCiclos } from "../../Servicios/CicloService";

const InstitucionCard = ({ institucion, onDelete, onEdit}) => {

     const navigate = useNavigate();
    
    const setInstitutionId = useStore((state) => state.setInstitutionId);
    const setCicloId = useCicloStore((state) => state.setCicloId);
    const setPeriodoId = usePeriodoStore((state) => state.setPeriodoId);

    const [dialogVisible, setDialogVisible] = useState(false);
    const [ciclos, setCiclos] = useState([]);
    const [selectedCiclo, setSelectedCiclo] = useState(null);
    const [selectedPeriodo, setSelectedPeriodo] = useState(null);
    const [periodos, setPeriodos] = useState([]);

    const handleAddCiclo = () => {
        setInstitutionId(institucion.Inst_Id);
        navigate('/StepsFormPage');
    }

    useEffect(() => {
        const fetchCiclos = async () => {
            try {
                const ciclos = await getCiclos(institucion.Inst_Id);
                setCiclos(ciclos);
            } catch (error) {
                console.error(error);
            }
        }

        fetchCiclos();
    }
    , [institucion.Inst_Id]);

    useEffect(() => {
        if (selectedCiclo) {
            const filteredPeriodos = ciclos
                .filter((c) => c.cicloId === selectedCiclo.cicloId)
                .map((c) => ({
                    datos: c.periodos.map((p) => ({
                        periodoId: p.periodoId,
                        nombre: p.nombre,
                    })),
                }));
            
            const periodos = filteredPeriodos[0].datos;
            setPeriodos(periodos);
        } else {
            setPeriodos([]);
        }
    }, [selectedCiclo, ciclos]);

    const handleAccept = () => {
        if (selectedCiclo && selectedPeriodo) {
            setInstitutionId(institucion.Inst_Id);
            setCicloId(selectedCiclo.cicloId);
            setPeriodoId(selectedPeriodo.periodoId);
            navigate('/MenuPage'); 
        } else {
            alert("Debe seleccionar un ciclo y un periodo.");
        }
    };

    return (
        <div className="card">
            <h2>{institucion.Inst_Nombre}</h2>
            <p><strong>Tipo:</strong> {institucion.Inst_Tipo}</p>
            <p><strong>Dirección Regional:</strong> {institucion.Inst_DireccionRegional}</p>
            <p><strong>Circuito:</strong> {institucion.Inst_Circuito}</p>
            <div className="card-actions">
                <Button label="Ingresar" icon="pi pi-home" className="p-button-primary" severity="success" onClick={() => setDialogVisible(true)}  />
                <Button label="Editar Institución" icon="pi pi-pencil" className="p-button-info" severity="info" onClick={onEdit} />
                <Button label="Ingresar Ciclo" icon="pi pi-calendar" className="p-button-help" severity="help" onClick={handleAddCiclo} />
                {/* <Button label="Ciclos anteriores" icon="pi pi-calendar" className="p-button-warning" severity="warning" /> */}
                <Button label="Eliminar" icon="pi pi-trash" className="p-button-danger" severity="danger" onClick={onDelete} />
            </div>
            <Dialog
                header="Seleccionar ciclo y periodo"
                visible={dialogVisible}
                style={{ width: "50vw" }}
                onHide={() => setDialogVisible(false)}
            >
                <div className="p-grid p-fluid">
                    <div className="p-col-12">
                        <Dropdown
                            value={selectedCiclo}
                            options={ciclos}
                            onChange={(e) => setSelectedCiclo(e.value)}
                            optionLabel={(c) => `${c.cicloId} - ${new Date(c.fechaInicio).toISOString().split('T')[0]} - ${new Date(c.fechaFin).toISOString().split('T')[0]}`}
                            placeholder="Seleccione un ciclo"
                        />
                    </div>
                    <div className="p-col-12" style={{ marginTop: "1rem" }}>
                        <Dropdown
                            value={selectedPeriodo}
                            options={periodos}
                            onChange={(e) => setSelectedPeriodo(e.value)}
                            optionLabel="nombre"
                            placeholder="Seleccione un periodo"
                            disabled={!selectedCiclo}
                        />
                    </div>
                    <div className="p-col-12" style={{ marginTop: "1rem" }}>
                        <Button label="Aceptar" onClick={handleAccept} />
                    </div>
                </div>
            </Dialog>

        </div>
    );
};

export default InstitucionCard;
