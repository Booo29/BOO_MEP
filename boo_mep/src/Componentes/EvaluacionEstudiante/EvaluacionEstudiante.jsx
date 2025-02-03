import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

import {getGradoSecciones} from "../../Servicios/GradoSeccionService";
import {GetMateriasByGradoSeccion} from "../../Servicios/MateriaService";
import {GetEvaluaciones} from "../../Servicios/EvaluacionService";
import {getEstudiantesNotas,postEstudianteNota,putEstudianteNota} from "../../Servicios/NotasService";

import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import usePeriodoStore from '../../store/PeriodoStore';

const EvaluacionEstudiante = () => {

  const navigate = useNavigate();

  const cicloId = useCicloStore((state) => state.cicloId);
  const institutionId = useStore((state) => state.institutionId);
  const periodoId = usePeriodoStore((state) => state.periodoId);

  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [selectedEvaluacion, setSelectedEvaluacion] = useState(null);
  const [notaGlobal, setNotaGlobal] = useState("");
  const [porcentajeGlobal, setPorcentajeGlobal] = useState("");

  useEffect(() => {
    const fetchData = async () => {
        try{
            const grados = await getGradoSecciones(cicloId, institutionId);
            setSecciones(
                grados.map((grado) => ({
                    Gra_Sec_Nombre: `${grado.Gra_Nombre} - ${grado.Gra_Sec_Nombre}`,
                    Id_Grado_Seccion: grado.Id_Grado_Seccion,
                    Gra_Nombre: grado.Gra_Nombre,
                }))
            );
        }
        catch(error){
            console.error(error);
        }
    };

    fetchData();
    
  }, []);

  useEffect(() => {
    if (selectedSeccion) {
      GetMateriasByGradoSeccion(selectedSeccion.Id_Grado_Seccion).then(
        setMaterias
      );
    }
  }, [selectedSeccion]);

  useEffect(() => {
    if (selectedMateria) {
      const fetchData = async () => {
        try{
            const evaluaciones = await GetEvaluaciones(
                selectedMateria.Mat_Nombre,
                selectedSeccion.Gra_Nombre,
                periodoId
            );
            setEvaluaciones(evaluaciones);
        }
        catch(error){
            console.error(error);
        }
    }
    fetchData();
    }
  }, [selectedMateria]);

  useEffect(() => {
    if (selectedEvaluacion) {
      const fetchData = async () => {
        try{
            const notas = await getEstudiantesNotas(
                selectedMateria.Mat_gra_sec_Id,
                selectedMateria.Mat_Id,
                selectedEvaluacion.Eva_Id,
            );
           
            setEstudiantes(notas);
        }
        catch(error){
            console.error(error);
        }
    }
    fetchData();
    }
  }, [selectedEvaluacion]);

  const handleEdit = (rowData, field, value) => {
    const updatedEstudiantes = estudiantes.map((est) =>
      est.Est_Id === rowData.Est_Id ? { ...est, [field]: value } : est
    );
    setEstudiantes(updatedEstudiantes);
  };

  const onCellEditComplete = (e) => {
    let { rowData, newValue, field } = e;
    let updatedEstudiantes = [...estudiantes];
    let index = updatedEstudiantes.findIndex(student => student.Est_Id === rowData.Est_Id);
    
    if (field === "EvaEst_PuntosObtenidos" && newValue > selectedEvaluacion.Eva_Puntos) {
        newValue = selectedEvaluacion.Eva_Puntos;
    }
    if (field === "EvaEst_PorcentajeObtenido" && newValue > selectedEvaluacion.Eva_Porcentaje) {
        newValue = selectedEvaluacion.Eva_Porcentaje;
    }
    if (field === "EvaEst_NotaFinal" && newValue > 100) {
        newValue = 100;
    }

    updatedEstudiantes[index][field] = newValue;
    updatedEstudiantes[index].EvaEst_NotaFinal = (updatedEstudiantes[index].EvaEst_PuntosObtenidos * 100) / selectedEvaluacion.Eva_Puntos;
    setEstudiantes(updatedEstudiantes);
};

const applyGlobalValues = () => {
    let updatedEstudiantes = estudiantes.map(student => ({
        ...student,
        EvaEst_PorcentajeObtenido: porcentajeGlobal > selectedEvaluacion.Eva_Porcentaje ? selectedEvaluacion.Eva_Porcentaje : porcentajeGlobal,
        EvaEst_PuntosObtenidos: notaGlobal > selectedEvaluacion.Eva_Puntos ? selectedEvaluacion.Eva_Puntos : notaGlobal,
        EvaEst_NotaFinal: (notaGlobal * 100) / selectedEvaluacion.Eva_Puntos
    }));
    setEstudiantes(updatedEstudiantes);
};

  const handleSave = () => {
    try{
        const notaNueva = [];
        const NotaActualizada = [];
    
        estudiantes.forEach((est) => {
            const data = {
                EvaEst_PuntosObtenidos: est.EvaEst_PuntosObtenidos,
                EvaEst_PorcentajeObtenido: est.EvaEst_PorcentajeObtenido,
                EvaEst_NotaFinal: est.EvaEst_NotaFinal,
                Evaluaciones_Eva_Id: selectedEvaluacion.Eva_Id,
                Estudiantes_Est_Id: est.Est_Id,
                Materia_grado_seccion_Mat_gra_sec_Id: selectedMateria.Mat_gra_sec_Id,
            };
            if (est.EvaEst_Id) {
                
                NotaActualizada.push({...data, EvaEst_Id: est.EvaEst_Id});
            } else {
               
                notaNueva.push(data);
            }
        });
        if(notaNueva.length > 0){
            
            postEstudianteNota(notaNueva);
        }
        if(NotaActualizada.length > 0){

            putEstudianteNota(NotaActualizada);
        }
        Swal.fire({
            title: "Notas Guardadas",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
        });
    }
    catch(error){
        console.error(error);
        Swal.fire({
            title: "Error al guardar las notas",
            icon: "error",
            timer: 1500,
            showConfirmButton: false,
        });
    }
        
  };


  const handleMenu = () => {
    navigate('/MenuPage');
  };

  

  return (
    <div style={{ padding: "16px" }} >
      <Button label="Regresar" severity="help" onClick={handleMenu} />
      <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Registro de Notas</h1>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}> 
            <Dropdown
                value={selectedSeccion}
                options={secciones}
                onChange={(e) => setSelectedSeccion(e.value)}
                optionLabel="Gra_Sec_Nombre"
                placeholder="Seleccione una Sección"
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
            />
        </div>
        <div style={{ flex: 1 }}>
            <Dropdown
                value={selectedMateria}
                options={materias}
                onChange={(e) => setSelectedMateria(e.value)}
                optionLabel="Mat_Nombre"
                placeholder="Seleccione una Materia"
                disabled={!selectedSeccion}
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
            />
        </div>
        <div style={{ flex: 1 }}>
            <Dropdown
                value={selectedEvaluacion}
                options={evaluaciones}
                onChange={(e) => setSelectedEvaluacion(e.value)}
                optionLabel="Eva_Nombre"
                placeholder="Seleccione una Evaluación"
                disabled={!selectedMateria}
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
            />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
            Aquí puedes ingresar los puntos globales y el porcentaje global que se aplicará a todos los estudiantes.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '20px', marginTop: '20px' }}>
        <div style={{ flex: 1 }}>
            <InputNumber
                value={notaGlobal}
                onChange={(e) => setNotaGlobal(e.value)}
                placeholder="Puntos Global"
                style={{ width: '100%' }}
            />
        </div>
        <div style={{ flex: 1 }}>     
            <InputNumber
                value={porcentajeGlobal}
                onChange={(e) => setPorcentajeGlobal(e.value)}
                placeholder="Porcentaje Global"
                style={{ width: '100%' }}
            />
        </div>
            
      </div>

      <Button label="Aplicar a todos" onClick={applyGlobalValues} />

      <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

      <DataTable value={estudiantes} editMode="cell" stripedRows emptyMessage="No hay estudiantes para mostrar">
        <Column field="Est_Identificacion" header="Identificacion" />
        <Column field="Est_Nombre" header="Nombre" />
        <Column field="Est_PrimerApellido" header="Primer Apellido" />
        <Column field="Est_SegundoApellido" header="Segundo Apellido" />

        <Column field="Eva_Porcentaje" header="% Evaluación" body={() => selectedEvaluacion?.Eva_Porcentaje} />
        <Column field="Eva_Puntos" header="Puntos Evaluación" body={() => selectedEvaluacion?.Eva_Puntos} />

        <Column field="EvaEst_PorcentajeObtenido" header="% Obtenido"  editor={(options) => (
            <InputNumber 
                value={options.value}
                onValueChange={(e) => options.editorCallback(e.value)} 
                min={0} 
                max={selectedEvaluacion?.Eva_Porcentaje} 
                mode="decimal"
                placeholder="Porcentaje"
            />
        )} 
        onCellEditComplete={onCellEditComplete} 
        />

        <Column field="EvaEst_PuntosObtenidos" header="Puntos Obtenidos" editor={(options) => (
            <InputNumber 
                value={options.value} 
                onValueChange={(e) => options.editorCallback(e.value)} 
                min={0} 
                max={selectedEvaluacion?.Eva_Puntos} 
                mode="decimal"
            />
        )} onCellEditComplete={onCellEditComplete} />

        <Column field="EvaEst_NotaFinal" header="Nota Final" editor={(options) => (
            <InputNumber 
                value={options.value} 
                onValueChange={(e) => options.editorCallback(e.value)}
                min={0} 
                max={100}
                mode="decimal"
                
            />
        )} onCellEditComplete={onCellEditComplete} />
                
      </DataTable>
      <Button 
        label="Guardar Notas" 
        onClick={handleSave} 
        style={{ marginTop: "16px" }}
     />
    </div>
  );
};

export default EvaluacionEstudiante;
