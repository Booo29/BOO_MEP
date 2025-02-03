import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import useEvaluacionStore from '../../store/EvaluacionStore';

import {
    GetIndicadores,
    GetNivelesDesempeno,
    PostIndicadores,
    PostNivelesDesempeno,
    PostIndicadoresEvaluacionNiveles
} from '../../Servicios/EvaluacionService';

const CrearIndicadoresyNiveles = () => {

    const navigate = useNavigate();
    
    const evaluacionId = useEvaluacionStore((state) => state.evaluacionId);

    const [indicadores, setIndicadores] = useState([]);
    const [nivelesDesempeno, setNivelesDesempeno] = useState([]);
    const [selectedIndicadores, setSelectedIndicadores] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [visibleIndicador, setVisibleIndicador] = useState(false);
    const [visibleNivel, setVisibleNivel] = useState(false);
    const [nuevoIndicador, setNuevoIndicador] = useState('');
    const [nuevoNivel, setNuevoNivel] = useState({ nivel: '', puntos: '', descripcion: '' });


    useEffect(() => {
        GetIndicadores().then(setIndicadores);
        GetNivelesDesempeno().then(setNivelesDesempeno);
    }, []);

    const handleIndicadorSelect = (e) => {
        setSelectedIndicadores(e.value);
        const updatedTableData = e.value.map(indicador => ({
            Ind_Id: indicador.Ind_Id,
            Ind_Nombre: indicador.Ind_Nombre,
            selectedNiveles: [],
            nivelesInfo: ''
        }));
        setTableData(updatedTableData);
    };

    const handleNivelSelect = (e, rowData) => {
        const updatedTable = tableData.map(row =>
            row.Ind_Id === rowData.Ind_Id
                ? { ...row, selectedNiveles: e.value, nivelesInfo: e.value.map(n => n.Niv_Nivel).join(', ') }
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
        const payload = tableData.map(row => ({
            Evaluaciones_Eva_Id: evaluacionId, 
            Indicadores_Ind_Id: row.Ind_Id,
            Indicadores_Desempeno: row.selectedNiveles.map(nivel => ({ Niveles_desempeno_Niv_Id: nivel.Niv_Id }))
        }));
        PostIndicadoresEvaluacionNiveles(payload);
        Swal.fire({
          icon: 'success',
          title: 'Indicadores y niveles de desempeño creados correctamente',
          showConfirmButton: false,
          position: 'top-end',
          timer: 1500
        });
        navigate('/EvaluacionesPage');
        
    };

    return (
        <div>
            <h2 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '24px' }}>Gestión de Indicadores</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MultiSelect value={selectedIndicadores} options={indicadores} onChange={handleIndicadorSelect} optionLabel="Ind_Nombre" placeholder="Selecciona Indicadores" />
                <Button label="Crear Indicador" onClick={() => setVisibleIndicador(true)} />
                <Button label="Crear Nivel de Desempeño" onClick={() => setVisibleNivel(true)} />
            </div>
            <DataTable value={tableData} style={{ marginTop: '20px' }} emptyMessage="No hay indicadores ingresados" stripedRows>
                <Column field="Ind_Nombre" header="Nombre del Indicador" />
                <Column field="selectedNiveles" header="Niveles de Desempeño" body={rowData => (
                    <MultiSelect value={rowData.selectedNiveles} options={nivelesDesempeno} onChange={(e) => handleNivelSelect(e, rowData)} optionLabel="Niv_Nivel" placeholder="Selecciona Niveles" />
                )} />
                <Column field="nivelesInfo" header="Información de Niveles" />
                <Column body={(rowData) => (
                    <Button icon="pi pi-trash" className="p-button-danger" onClick={() => setTableData(tableData.filter(item => item.Ind_Id !== rowData.Ind_Id))} />
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
            <Button label="Guardar Todo" style={{ marginTop: '20px' }} onClick={handleSave} />
        </div>
    );
};

export default CrearIndicadoresyNiveles;
