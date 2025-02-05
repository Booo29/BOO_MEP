import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import {GetEvaluaciones, DeleteEvaluacion} from '../../Servicios/EvaluacionService'; 
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

    const [expandedRows, setExpandedRows] = useState(null); // Estado para manejar las filas expandidas


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

    const handleDelete = (id) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, bórralo'
        }).then((result) => {
            if (result.isConfirmed) {
                DeleteEvaluacion(id).then(() => {
                    Swal.fire({
                        icon: "success",
                        title: "Evaluación eliminada",
                        text: "La evaluación ha sido eliminada exitosamente.",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    setEvaluaciones(evaluaciones.filter((evaluacion) => evaluacion.id !== id));
                }).catch((error) => {
                    Swal.fire(
                        '¡Error!',
                        'Ha ocurrido un error al intentar eliminar la evaluación.',
                        'error'
                    );
                });
            }
        });
    }

    const handleMenu = () => {
        navigate('/MenuPage');
      }

          // Función para mostrar la tabla de indicadores cuando se expande la fila
    const rowExpansionTemplate = (rowData) => {
        return (
            <div style={{ padding: "16px" }}>
                {rowData.indicadores.length > 0 ? (
                    <DataTable value={rowData.indicadores} responsiveLayout="scroll">
                        <Column field="nombre" header="Indicador" />
                        <Column body={(rowData) => (
                            <DataTable value={rowData.niveles} responsiveLayout="scroll">
                                <Column field="nivel" header="Nivel" />
                                <Column field="puntos" header="Puntos" />
                                <Column field="descripcion" header="Descripción" />
                            </DataTable>
                        )} header="Niveles" />
                    </DataTable>
                ) : (
                    <p style={{ textAlign: "center", fontWeight: "bold", color: "gray" }}>
                        No tienen indicadores asignados
                    </p>
                )}
            </div>
        );
    };


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
    
            <DataTable 
                value={evaluaciones} 
                emptyMessage="No hay evaluaciones registradas" 
                stripedRows
                // expandableRowGroups
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data)}
                rowExpansionTemplate={rowExpansionTemplate}
                dataKey="id"
            >
                <Column expander style={{ width: '3rem' }} />
                <Column field="nombre" header="Nombre" />
                <Column field="puntos" header="Puntos" />
                <Column field="porcentaje" header="Porcentaje" />
                <Column field="fecha" header="Fecha" />

                <Column body={(rowData) => (
                    <div style={{ display: "flex", gap: "8px" }}>
                        {/* <Button icon="pi pi-pencil" className="p-button-warning" onClick={() => {}} /> */}
                        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => handleDelete(rowData.id)} />
                    </div>
                )} />
            </DataTable>
        </div>
    );

}
    

export default EvaluacionesPrincipal;