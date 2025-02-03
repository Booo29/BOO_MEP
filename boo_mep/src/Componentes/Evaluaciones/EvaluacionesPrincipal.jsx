import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';

import {GetEvaluaciones} from '../../Servicios/EvaluacionService'; 
import {getGradoSecciones} from '../../Servicios/GradoSeccionService';
import {GetMateriasByGradoSeccion} from '../../Servicios/MateriaService';

import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import usePeriodoStore from '../../store/PeriodoStore';
import useMateriaStore from '../../store/MateriaStore';
import useGradoStore from '../../store/GradoStore';

const EvaluacionesPrincipal = () => {

    const navigate = useNavigate();

    const cicloId = useCicloStore((state) => state.cicloId);
    const institutionId = useStore((state) => state.institutionId);
    const periodoId = usePeriodoStore((state) => state.periodoId);

    const setMateriaNombre = useMateriaStore((state) => state.setMateriaNombre);
    const setGradoNombre = useGradoStore((state) => state.setGradoNombre);

    const [grados, setGrados] = useState([]);
    const [materias, setMaterias] = useState( []);
    const [selectedGrado, setSelectedGrado] = useState(null);
    const [selectedMateria, setSelectedMateria] = useState(null);
    const [evaluaciones, setEvaluaciones] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const grados = await getGradoSecciones(cicloId, institutionId);

            const gradosUnicos = grados.filter((grado, index, self) =>
                index === self.findIndex((t) => (
                    t.Gra_Nombre === grado.Gra_Nombre
                ))
            );

            setGrados(gradosUnicos.map((grado) => ({
                label: grado.Gra_Nombre,
                value: { id: grado.Id_Grado_Seccion, nombre: grado.Gra_Nombre }
            })));
        }

        fetchData();
    }, []);


  useEffect(() => {
    const fetchMaterias = async () => {
      if (selectedGrado) {
        try {
          const response = await GetMateriasByGradoSeccion(selectedGrado.id);
          setMaterias(
            response.map((mat) => ({
              label: mat.Mat_Nombre,
              value: { id: mat.Mat_Id, nombre: mat.Mat_Nombre }
            }))
          );
        } catch (error) {
          console.error("Error cargando materias:", error);
        }
      }
    };
    fetchMaterias();
  }, [selectedGrado]);
   
    useEffect(() => {
        if (selectedGrado && selectedMateria) {
            GetEvaluaciones(selectedMateria.nombre, selectedGrado.nombre, periodoId).then(data => {
                setEvaluaciones(data);
            });
        }
    
    }, [selectedGrado, selectedMateria]);

    const handleCreate = () => {
        navigate('/EvaluacionesStepFormPage');
        setMateriaNombre(selectedMateria.nombre);
        setGradoNombre(selectedGrado.nombre);
    }

    const handleMenu = () => {
        navigate('/MenuPage');
      }


    return (
        <div style={{ padding: "16px" }}>
           <Button label="Regresar" severity="help" onClick={handleMenu} />
            <h1 style={{ textAlign: "center", fontWeight: "bold", fontSize: "34px", marginBottom: "16px" }}>
                Crear Evaluación
            </h1>
    
            {/* Contenedor para los dropdowns en una misma fila */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
                <div style={{ flex: 1 }}>
                    <label htmlFor="grado" style={{fontWeight: "bold"}}>Grado</label>
                    <Dropdown 
                        id="grado" 
                        value={selectedGrado} 
                        options={grados} 
                        onChange={(e) => setSelectedGrado(e.value)} 
                        placeholder="Selecciona un grado" 
                        style={{ width: "100%" }}
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <label htmlFor="materia" style={{fontWeight: "bold"}}>Materia</label>
                    <Dropdown 
                        id="materia" 
                        value={selectedMateria} 
                        options={materias} 
                        onChange={(e) => setSelectedMateria(e.value)} 
                        disabled={!selectedGrado}
                        placeholder="Selecciona una materia"
                        style={{ width: "100%" }}
                    />
                </div>
            </div>
    
            <Button 
                label="Crear Evaluación" 
                style={{ marginBottom: "16px" }} 
                onClick={handleCreate} 
                disabled={!selectedGrado || !selectedMateria}
            />
    
            <DataTable value={evaluaciones} emptyMessage="No hay evaluaciones registradas" stripedRows>
                <Column field="Eva_Nombre" header="Nombre" />
                <Column field="Eva_Puntos" header="Puntos" />
                <Column field="Eva_Porcentaje" header="Porcentaje" />
                <Column field="Eva_Fecha" header="Fecha" />
                <Column body={(rowData) => (
                    <div style={{ display: "flex", gap: "8px" }}>
                        {/* <Button icon="pi pi-pencil" className="p-button-warning" onClick={() => {}} /> */}
                        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => {}} />
                    </div>
                )} />
            </DataTable>
        </div>
    );

}
    

export default EvaluacionesPrincipal;