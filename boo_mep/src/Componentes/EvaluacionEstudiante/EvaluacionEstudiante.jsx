import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { ColumnGroup } from 'primereact/columngroup';
import { Row } from 'primereact/row';
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
                selectedEvaluacion.id,
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


  const onCellEditComplete = (e) => {
    let { rowData, newValue, field } = e;
    let updatedEstudiantes = [...estudiantes];
    let index = updatedEstudiantes.findIndex(student => student.id === rowData.id);
    
        if (field === "puntosObtenidos}" && newValue > selectedEvaluacion.puntos) {
            newValue = selectedEvaluacion.puntos;
        }
        if (field === "porcentajeObtenido" && newValue > selectedEvaluacion.porcentaje) {
            newValue = selectedEvaluacion.porcentaje;
        }
        if (field === "notaFinal" && newValue > 100) {
            newValue = 100;
        }

        updatedEstudiantes[index][field] = newValue;
   
    updatedEstudiantes[index].evaluacion.notaFinal = (updatedEstudiantes[index].evaluacion.puntosObtenidos * 100) / selectedEvaluacion.puntos;
    updatedEstudiantes[index].evaluacion.porcentajeObtenido = ((updatedEstudiantes[index].evaluacion.notaFinal * selectedEvaluacion.porcentaje) / 100);

    setEstudiantes(updatedEstudiantes);
};

const applyGlobalValues = () => {

    let updatedEstudiantes = estudiantes.map(student => {
        // Si la evaluación tiene indicadores, distribuimos la nota entre ellos
        if (selectedEvaluacion?.indicadores?.length > 0) {
            

            let updatedIndicadores = selectedEvaluacion.indicadores.map(indicador => ({
                id: indicador.id,
                nota: notaGlobal
            }));

            let puntosObtenidos = updatedIndicadores.reduce((acc, ind) => acc + ind.nota, 0);
            let notaFinal = (puntosObtenidos * 100) / selectedEvaluacion.puntos;
            let porcentajeObtenido = (notaFinal * selectedEvaluacion.porcentaje) / 100;

            return {
                ...student,
                indicadores: updatedIndicadores,
                evaluacion: {
                    ...student.evaluacion,
                    puntosObtenidos,
                    notaFinal,
                    porcentajeObtenido
                }
            };
        } else {
            // Caso sin indicadores, asignamos los puntos globalmente
            let puntosObtenidos = Math.min(notaGlobal, selectedEvaluacion.puntos);
            let notaFinal = (puntosObtenidos * 100) / selectedEvaluacion.puntos;
            let porcentajeObtenido = (notaFinal * selectedEvaluacion.porcentaje) / 100;

            return {
                ...student,
                evaluacion: {
                    ...student.evaluacion,
                    puntosObtenidos,
                    notaFinal,
                    porcentajeObtenido
                }
            };
        }
    });

    setEstudiantes(updatedEstudiantes);

};

  const handleSave = () => {
    try{
        const notaNueva = [];
        const NotaActualizada = [];
    
        estudiantes.forEach((est) => {
            const data = {
                EvaEst_PuntosObtenidos: est.evaluacion.puntosObtenidos,
                EvaEst_PorcentajeObtenido: est.evaluacion.porcentajeObtenido,
                EvaEst_NotaFinal: est.evaluacion.notaFinal,
                Evaluaciones_Eva_Id: selectedEvaluacion.id,
                Estudiantes_Est_Id: est.id,
                EvaEst_Id: est.evaluacion.id,
                Materia_grado_seccion_Mat_gra_sec_Id: selectedMateria.Mat_gra_sec_Id,
                evaluacionIndicadores: est.indicadores.map(ind => 
                    ({ 
                        Eva_Ind_Id : ind.idEvaluacionIndicador,
                        Eva_Ind_Nota: ind.nota, 
                        Evaluacion_Estudiante_EvaEst_Id : est.evaluacion.id,
                        Indicadores_Desempeno_Ind_Des_Id: ind.id 
                    })),

            };
            if(est.evaluacion.id === null || !est.evaluacion.id || est.evaluacion.id === ''){
                notaNueva.push(data);
            }
            else{
                NotaActualizada.push(data);
            }
        });
        if(notaNueva.length > 0){
            
            console.log(notaNueva);
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

  const headerGroup = (
    <ColumnGroup>
        <Row>
            {/* Encabezados fijos */}
            <Column header="Identificación" rowSpan={2} />
            <Column header="Nombre" rowSpan={2} />
            <Column header="Primer Apellido" rowSpan={2} />
            <Column header="Segundo Apellido" rowSpan={2} />
            <Column header="% Evaluación" rowSpan={2} />
            <Column header="Puntos Evaluación" rowSpan={2} />

            {/* Encabezados dinámicos para indicadores */}
            {selectedEvaluacion?.indicadores?.map((indicador) => (
                <Column 
                    style={{ minWidth: '500px' }} 
                    key={indicador.id} 
                    header={indicador.niveles.map(nivel => `${nivel.nivel} : ${nivel.puntos} pts`).join(" | ")} 
                />
            ))}

            <Column header="Puntos Obtenidos" rowSpan={2} />
            <Column header="% Obtenido" rowSpan={2} />
            
            <Column header="Nota Final" rowSpan={2} />
        </Row>

        <Row>
            {/* Subcolumnas de niveles de desempeño */}
            {selectedEvaluacion?.indicadores?.map((indicador) =>
                <Column key={indicador.id} header={indicador.nombre} />
            )}
        </Row>
    </ColumnGroup>
);


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
                optionLabel="nombre"
                placeholder="Seleccione una Evaluación"
                disabled={!selectedMateria}
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
            />
        </div>
      </div>

      <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

      <div style={{ marginBottom: "16px" }}>
        <p style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
            Aquí puedes ingresar los puntos globales para que se les aplique a todos los estudiantes.
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
            
      </div>

      <Button label="Aplicar a todos" onClick={applyGlobalValues} />

      <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

      <DataTable showGridlines  value={estudiantes} editMode="cell" stripedRows emptyMessage="No hay estudiantes para mostrar" headerColumnGroup={headerGroup}  scrollable scrollHeight="500px" >
        <Column field="identificacion" sortable/>
        <Column field="nombre" sortable/>
        <Column field="primerApellido" sortable/>
        <Column field="segundoApellido" sortable/>

        <Column field="porcentaje"  body={() => selectedEvaluacion?.porcentaje}/>
        <Column field="puntos"  body={() => selectedEvaluacion?.puntos}/>

        {selectedEvaluacion?.indicadores?.map((indicador) => {
           
            const evaluacion = estudiantes
                .map(est => 
                    est.indicadores
                        .map(ind => ind.id)
                        .includes(indicador.id) ? est.indicadores.find(ind => ind.id === indicador.id) : null
                )
                .find(e => e !== null);

            const nota = evaluacion ? evaluacion.nota : 0; 

            return (
                <Column
                    key={indicador.id}
                    field={`indicador_${indicador.id}`}
                    body={(rowData) => rowData.indicadores.find(ind => ind.id === indicador.id)?.nota || 0}
                    editor={(options) => {
                        const value = options.rowData.indicadores.find(ind => ind.id === indicador.id)?.nota || 0;
                        return (
                            <InputNumber 
                                value={value} 
                                onValueChange={(e) => options.editorCallback(e.value)} 
                                min={0} 
                                style={{ width: '100%' }} 
                                mode="decimal"
                            />
                        );
                    }} 
                    onCellEditComplete={(e) => {
                        let { rowData, newValue, field } = e;
                        let updatedEstudiantes = [...estudiantes];

                        let index = updatedEstudiantes.findIndex(student => student.id === rowData.id);
                        
                        if (index === -1) return; // Si no se encuentra el estudiante, salimos

                        let indicadores = updatedEstudiantes[index].indicadores;
                        let indicadorIndex = indicadores.findIndex(ind => ind.id === indicador.id);
                        
                        if (indicadorIndex === -1) {
                            // Si no encontramos el indicador en la lista de indicadores del estudiante, lo agregamos
                            indicadores.push({ id: indicador.id, nota: newValue });
                        } else {
                            // Si encontramos el indicador, actualizamos la nota
                            indicadores[indicadorIndex].nota = newValue;
                        }

                        //Se suma cada indicador para obtener el total de puntos obtenidos

                        let puntosObtenidos = indicadores.reduce((acc, ind) => acc + ind.nota, 0);
                    
                        let notaFinal = (puntosObtenidos * 100 ) / selectedEvaluacion.puntos;

                        let porcentajeObtenido = (notaFinal * selectedEvaluacion.porcentaje) / 100;

                        updatedEstudiantes[index].evaluacion.puntosObtenidos = puntosObtenidos;

                        updatedEstudiantes[index].evaluacion.porcentajeObtenido = porcentajeObtenido;

                        updatedEstudiantes[index].evaluacion.notaFinal = notaFinal;

                        updatedEstudiantes[index].indicadores = indicadores;
                        
                        setEstudiantes(updatedEstudiantes); // Actualizamos el estado con los estudiantes modificados
                    }}
                />
            );
        })}

        <Column field="evaluacion.puntosObtenidos" editor={(options) => (
            <InputNumber 
                value={options.value} 
                onValueChange={(e) => options.editorCallback(e.value)} 
                min={0} 
                max={selectedEvaluacion?.puntos} 
                mode="decimal"
            />
        )} onCellEditComplete={onCellEditComplete} />       


        <Column field="evaluacion.porcentajeObtenido"  editor={(options) => (
            <InputNumber 
                value={options.value}
                onValueChange={(e) => options.editorCallback(e.value)} 
                min={0} 
                max={selectedEvaluacion?.porcentaje} 
                mode="decimal"
                placeholder="Porcentaje"
            />
        )} 
        onCellEditComplete={onCellEditComplete} 
        />


        <Column field="evaluacion.notaFinal" editor={(options) => (
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