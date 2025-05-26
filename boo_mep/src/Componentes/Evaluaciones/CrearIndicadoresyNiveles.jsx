import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Swal from 'sweetalert2';
import useEvaluacionStore from '../../store/EvaluacionStore';

import {
    GetIndicadores,
    GetNivelesDesempeno,
    PostIndicadores,
    PostNivelesDesempeno,
    PostIndicadoresEvaluacionNiveles,
    GetEvaluacionIndicadoresNivelesById
} from '../../Servicios/EvaluacionService';

const CrearIndicadoresyNiveles = () => {
    
    const evaluacionId = useEvaluacionStore((state) => state.evaluacionId);

    const [indicadores, setIndicadores] = useState([]);
    const [nivelesDesempeno, setNivelesDesempeno] = useState([]);
    const [selectedIndicadores, setSelectedIndicadores] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [visibleIndicador, setVisibleIndicador] = useState(false);
    const [visibleNivel, setVisibleNivel] = useState(false);
    const [nuevoIndicador, setNuevoIndicador] = useState('');
    const [nuevoNivel, setNuevoNivel] = useState({ nivel: '', puntos: '', descripcion: '' });
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        GetIndicadores().then(setIndicadores);
        GetNivelesDesempeno().then(setNivelesDesempeno);
        if (evaluacionId) {
            GetEvaluacionIndicadoresNivelesById(evaluacionId).then((response) => {
                if (response && Array.isArray(response[0].indicadores)) {
                    const updatedTableData = response[0].indicadores.map(indicador => ({
                        Ind_Id: indicador.id,
                        Ind_Nombre: indicador.nombre,
                        selectedNiveles: indicador.niveles.map(nivel => ({
                            Niv_Id: nivel.id,
                            Niv_Nivel: nivel.nivel,
                            Niv_Descripcion: nivel.descripcion
                        })),
                        nivelesInfo: indicador.niveles.map(nivel => 
                            `${nivel.nivel}: ${nivel.descripcion}`
                        ).join('\n'),
                        isExisting: true
                    }));
                    setSelectedIndicadores(response[0].indicadores.map(ind => ({
                        Ind_Id: ind.id,
                        Ind_Nombre: ind.nombre
                    })));
    
                    setTableData(updatedTableData);
                    setIsEditMode(true);
                } else {
                    console.error('No vienen indicadores en el response:', response);
                }
            });
        }

    }, []);

    const handleIndicadorSelect = (e) => {

        const nuevosIndicadores = e.value.filter(newItem =>
            !tableData.some(existing => existing.Ind_Id === newItem.Ind_Id)
        );

        const newTableData = nuevosIndicadores.map(indicador => ({
            Ind_Id: indicador.Ind_Id,
            Ind_Nombre: indicador.Ind_Nombre,
            selectedNiveles: [],
            nivelesInfo: '',
            isNew: true // Marca como nuevo para diferenciarlos
        }));

        setTableData(prev => [...prev, ...newTableData]);
        setSelectedIndicadores(e.value);

        // setSelectedIndicadores(e.value);
        // const updatedTableData = e.value.map(indicador => ({
        //     Ind_Id: indicador.Ind_Id,
        //     Ind_Nombre: indicador.Ind_Nombre,
        //     selectedNiveles: [],
        //     nivelesInfo: ''
        // }));
        // setTableData(updatedTableData);
    };

    const handleNivelSelect = (e, rowData) => {
        const updatedTable = tableData.map(row =>
            row.Ind_Id === rowData.Ind_Id
                ? { 
                    ...row, 
                    selectedNiveles: e.value, 
                    nivelesInfo: e.value.map(n => `${n.Niv_Nivel}: ${n.Niv_Descripcion}`).join('\n') }
                : row
        );
        setTableData(updatedTable);
    };

    const handleCreateIndicador = () => {
        PostIndicadores({ Ind_Nombre: nuevoIndicador }).then(() => {
            GetIndicadores().then(setIndicadores);
            setNuevoIndicador('');
            setVisibleIndicador(false);
        });
        Swal.fire({
            icon: 'success',
            title: 'Indicador creado correctamente',
            showConfirmButton: false,
            position: 'top-end',
            timer: 1500
          });
    };

    const handleCreateNivel = () => {
        const data = {
            Niv_Nivel: nuevoNivel.nivel,
            Niv_Puntos: nuevoNivel.puntos,
            Niv_Descripcion: nuevoNivel.descripcion
        };
        PostNivelesDesempeno(data).then(() => {
            GetNivelesDesempeno().then(setNivelesDesempeno);
            setNuevoNivel({ nivel: '', puntos: '', descripcion: '' });
            setVisibleNivel(false);
        });
        Swal.fire({
            icon: 'success',
            title: 'Nivel de desempeño creado correctamente',
            showConfirmButton: false,
            position: 'top-end',
            timer: 1500
          });
    };

    const handleSave = () => {

        const dataToSend = isEditMode 
        ? tableData.filter(row => row.isNew) // Solo nuevos en modo edición
        : tableData;

        const payload = dataToSend.map(row => ({
            Evaluaciones_Eva_Id: evaluacionId, 
            Indicadores_Ind_Id: row.Ind_Id,
            Indicadores_Desempeno: row.selectedNiveles.map(nivel => ({ Niveles_desempeno_Niv_Id: nivel.Niv_Id }))
        }));

        if (payload.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No hay cambios para guardar',
                showConfirmButton: false,
                position: 'top-end',
                timer: 1500
            });
            return;
        }

        PostIndicadoresEvaluacionNiveles(payload).then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Indicadores y niveles de desempeño guardados correctamente',
                showConfirmButton: false,
                position: 'top-end',
                timer: 1500
            });

            // Reset states solo si no estás en edición
            if (!isEditMode) {
                setTableData([]);
                setSelectedIndicadores([]);
            } else {
                // Si estás en edición, marca como no nuevo después de guardar
                const updatedTable = tableData.map(row => ({ ...row, isNew: false }));
                setTableData(updatedTable);
            }
        });
        
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>Gestión de Indicadores</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MultiSelect 
                    value={selectedIndicadores} 
                    options={indicadores} 
                    onChange={handleIndicadorSelect} 
                    optionLabel={n => n.Ind_Nombre.length > 100 ? n.Ind_Nombre.substring(0, 100) + "..." : n.Ind_Nombre}
                    placeholder="Selecciona Indicadores" 
                    style={{ width: '50%' }}
                    display="chip" 
                    filter 
                    
                />
                <Button label="Crear Indicador" onClick={() => setVisibleIndicador(true)} />
                <Button label="Crear Nivel de Desempeño" onClick={() => setVisibleNivel(true)} />
            </div>
            <DataTable value={tableData} style={{ marginTop: '20px' }} emptyMessage="No hay indicadores ingresados" stripedRows>
                <Column field="Ind_Nombre" header="Nombre del Indicador" style={{maxWidth: '600px'}} />
                <Column 
                    field="selectedNiveles" 
                    header="Niveles de Desempeño" 
                    style={{ maxWidth: '500px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }} 
                        body={rowData => (
                            <MultiSelect 
                                value={rowData.selectedNiveles} 
                                options={nivelesDesempeno} 
                                onChange={(e) => handleNivelSelect(e, rowData)} 
                                optionLabel={n => `${n.Niv_Nivel}: ${n.Niv_Descripcion.length > 100 ? n.Niv_Descripcion.substring(0, 100) + "..." : n.Niv_Descripcion}`}
                                style={{ width: '80%'}}
                                display="chip"
                                filter
                                placeholder="Selecciona Niveles" 
                                disabled={rowData.isExisting}
                            />
                        )} 
                />
                <Column field="nivelesInfo" header="Información de Niveles" style={{ whiteSpace: 'pre-line', maxWidth: '500px' }} />
               
                <Column body={(rowData) => (
                    !rowData.isExisting ? (
                        <Button icon="pi pi-trash" className="p-button-danger" onClick={() => setTableData(tableData.filter(item => item.Ind_Id !== rowData.Ind_Id))} />
                    ) : null
                )} header="Quitar" />

            </DataTable>
            <Dialog header="Crear Indicador" visible={visibleIndicador} onHide={() => setVisibleIndicador(false)}>
                <InputTextarea value={nuevoIndicador} onChange={(e) => setNuevoIndicador(e.target.value)} rows={3} cols={30} placeholder="Nombre del Indicador" />
                <Button label="Guardar" onClick={handleCreateIndicador} />
            </Dialog>
            <Dialog header="Crear Nivel de Desempeño" visible={visibleNivel} onHide={() => setVisibleNivel(false)}>
                <InputTextarea value={nuevoNivel.descripcion} onChange={(e) => setNuevoNivel({ ...nuevoNivel, descripcion: e.target.value })} rows={3} cols={30} placeholder="Descripción" />
                <InputText type="text" value={nuevoNivel.nivel} onChange={(e) => setNuevoNivel({ ...nuevoNivel, nivel: e.target.value })} placeholder="Nivel" />
                <InputText type="number" value={nuevoNivel.puntos} onChange={(e) => setNuevoNivel({ ...nuevoNivel, puntos: e.target.value })} placeholder="Puntos" />
                <Button label="Guardar" onClick={handleCreateNivel} />
            </Dialog>
            <Button label="Guardar Indicador" style={{ marginTop: '20px' }} onClick={handleSave} />
        </div>
    );
};

export default CrearIndicadoresyNiveles;
