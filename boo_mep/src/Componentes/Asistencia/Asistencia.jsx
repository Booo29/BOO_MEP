import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { addLocale } from 'primereact/api';
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputTextarea } from 'primereact/inputtextarea';
import { useNavigate } from 'react-router-dom';

import {getGradoSecciones} from '../../Servicios/GradoSeccionService';
import {GetMateriasByGradoSeccion} from '../../Servicios/MateriaService';
import {getEstudiantes} from '../../Servicios/EstudiantesService';
import {postAsistencia, getAsistencia, putAsistencia} from '../../Servicios/AsistenciaService';

import "./Asistencia.css";

import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import usePeriodoStore from "../../store/PeriodoStore";

const Asistencia = () => {

  const navigate = useNavigate();

  const cicloId = useCicloStore((state) => state.cicloId);
  const institutionId = useStore((state) => state.institutionId);
  const periodoId = usePeriodoStore((state) => state.periodoId);

  const [secciones, setSecciones] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
 

  const [seccion, setSeccion] = useState(null);
  const [materia, setMateria] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [sesionSeleccionada, setSesionSeleccionada] = useState(null);
  const [estudiantesSesion, setEstudiantesSesion] = useState([]);

  const toast = React.useRef(null);

  addLocale('es', {
          firstDayOfWeek: 1,
          showMonthAfterYear: true,
          dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
          dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
          dayNamesMin: ['D', 'L', 'M', 'MI', 'J', 'V', 'S'],
          monthNames: ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'],
          monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
          today: 'Hoy',
          clear: 'Limpiar'
  });

  
  useEffect(() => {
    const fetchSecciones = async () => {
      try {
        const response = await getGradoSecciones(cicloId, institutionId);
        setSecciones(
          response.map((sec) => ({
            label: `${sec.Gra_Nombre} - ${sec.Gra_Sec_Nombre}`,
            value: sec.Id_Grado_Seccion,
          }))
        );
      } catch (error) {
        console.error("Error cargando secciones:", error);
      }
    };
    fetchSecciones();
  }, []);

 
  useEffect(() => {
    const fetchMaterias = async () => {
      if (seccion) {
        try {
          const response = await GetMateriasByGradoSeccion(seccion);
          setMaterias(
            response.map((mat) => ({
              label: mat.Mat_Nombre,
              value: mat,
            }))
          );
        } catch (error) {
          console.error("Error cargando materias:", error);
        }
      }
    };
    fetchMaterias();
  }, [seccion]);


    useEffect(() => {
      const fetchEstudiantesYAsistencias = async () => {
        if (materia && fecha) {
          try {
            // Obtener estudiantes
            const estudiantesResponse = await getEstudiantes(cicloId, seccion);
            const estudiantesData = estudiantesResponse.map((est) => ({
              id: est.Est_Identificacion,
              idEstudiante: est.Est_Id,
              nombre: `${est.Est_Nombre} ${est.Est_PrimerApellido} ${est.Est_SegundoApellido}`,
              estado: "Presente",
              justificacion: "",
            }));
  
            // Obtener asistencias
            const asistenciasResponse = await getAsistencia(periodoId, materia.Mat_gra_sec_Id, seccion, fecha.toISOString().split("T")[0]);
            const asistenciasData = asistenciasResponse;


            const estudiantesConAsistencias = estudiantesData.map((est) => {
              const asistenciasEstudiante = asistenciasData.filter(
                (asi) => asi.Est_Identificacion === est.id
              );
            
              return asistenciasEstudiante.length > 0
                ? asistenciasEstudiante.map((asistencia) => ({
                    ...est,
                    estado: asistencia.Asi_Asistencia ,
                    justificacion: asistencia.Asi_Justificacion || "",
                    lecciones: asistencia.Asi_Leccion ,
                    sesion: asistencia.Asi_Sesion || 1,
                    asistenciaId: asistencia.Asi_Id || null,
                  }))
                : [
                    {
                      ...est,
                      estado: "Presente",
                      justificacion: "",
                      lecciones: 1,
                      sesion: 1,
                      asistenciaId: null,
                    },
                  ];
            });
            
           
            const estudiantesPlanos = estudiantesConAsistencias.flat();

            const sesionesUnicas = [...new Set(estudiantesPlanos.map((est) => est.sesion))];

            setSesiones(sesionesUnicas);

            setEstudiantes(estudiantesPlanos);

            const estudiantesFiltrados = estudiantesPlanos.filter(est => est.sesion === sesionesUnicas[0]);


            setEstudiantesSesion(estudiantesFiltrados);


            setSesionSeleccionada(sesionesUnicas.length > 0 ? sesionesUnicas[0] : 1);

            
          } catch (error) {
            console.error("Error cargando estudiantes o asistencias:", error);
          }
        }
      };
      fetchEstudiantesYAsistencias();
    }, [materia, fecha]);
    

  const handleEstadoChange = (id, estado) => {
    const nuevosEstudiantes = estudiantesSesion.map((est) =>
      est.id === id ? { ...est, estado } : est
    );
    
    setEstudiantesSesion(nuevosEstudiantes);
  };

  const handleJustificacionChange = (id, justificacion) => {
    const nuevosEstudiantes = estudiantesSesion.map((est) =>
      est.id === id ? { ...est, justificacion } : est
    );
    setEstudiantesSesion(nuevosEstudiantes);
  };

  const handleLeccionesChange = (id, lecciones) => {
    const nuevosEstudiantes = estudiantesSesion.map((est) =>
      est.id === id ? { ...est, lecciones } : est
    );
    setEstudiantesSesion(nuevosEstudiantes);
  };


  const marcarTodos = (estado) => {
    const nuevosEstudiantes = estudiantesSesion.map((est) => ({
      ...est,
      estado,
      justificacion: estado === "Ausente Justificado" ? "" : est.justificacion,
    }));
    setEstudiantesSesion(nuevosEstudiantes);
  };

  const asignarLecciones = (lecciones) => {
    const nuevosEstudiantes = estudiantesSesion.map((est) => ({
      ...est,
      lecciones,
    }));
    setEstudiantesSesion(nuevosEstudiantes);
  };

  const guardarAsistencia = async () => {
    try {
      const asistenciasNuevas = [];
      const asistenciasActualizar = [];

      estudiantesSesion.forEach((est) => {
      const payload = {
        Asi_Fecha: fecha.toISOString().split("T")[0],
        Asi_Leccion: est.lecciones,
        Asi_Asistencia: est.estado,
        Asi_Justificacion: est.justificacion,
        Materia_grado_seccion_Mat_gra_sec_Id: materia.Mat_gra_sec_Id,
        Estudiantes_Est_Id: est.idEstudiante,
        Periodo_Per_Id: periodoId, 
        Asi_Sesion: est.sesion,
      };

      if (est.asistenciaId ) {

        asistenciasActualizar.push({ ...payload, Asi_Id: est.asistenciaId });
      }
      else {
        asistenciasNuevas.push(payload);
      }
    });

    if (asistenciasNuevas.length > 0) {


      await postAsistencia(asistenciasNuevas);
    }

    if (asistenciasActualizar.length > 0) {

       await putAsistencia(asistenciasActualizar);
    }
      toast.current.show({
        severity: "success",
        summary: "Éxito",
        detail: "Asistencia guardada correctamente",
      });
    } catch (error) {
      console.error("Error guardando asistencia:", error);
      toast.current.show({
        severity: "error",
        summary: "Error",
        detail: "No se pudo guardar la asistencia",
      });
    }
  };

  const handleNuevaSesion = () => {
    const nuevasesion = Math.max(...sesiones) + 1; // Obtener la última sesión y sumarle 1
    const nuevosEstudiantes = estudiantesSesion.map((est) => ({
      ...est,
      asistenciaId: null,
      estado: "Presente",
      justificacion: "",
      lecciones: 1,
      sesion: nuevasesion, // Asegurar que el campo correcto es actualizado
    }));
  
    setSesiones([...sesiones, nuevasesion]); // Agregar nueva sesión al array
    setEstudiantesSesion(nuevosEstudiantes);
    setSesionSeleccionada(nuevasesion);
  };

  const handleSesionChange = (sesion) => {
    setSesionSeleccionada(sesion);
    const estudiantesFiltrados = estudiantes.filter(est => est.sesion === sesion);
    console.log("estudiantes filtrados: ", estudiantesFiltrados);
    setEstudiantesSesion(estudiantesFiltrados);
  };


  const handleMenu = () => {
    navigate('/MenuPage');
  };


  return (
    <div style={{padding: "20px"}} >
       <Button label="Regresar" severity="help" onClick={handleMenu} />
      <div className="p-fluid" >
       
        <h1 style={{fontSize: "2em", fontWeight: "bold", marginLeft: "1%"}}>Registro de Asistencia</h1>
        <Toast ref={toast} />

        <div className="form-row" >
          {/* <div className="p-col-12 p-md-4" > */}
            <Dropdown
              value={seccion}
              options={secciones}
              onChange={(e) => setSeccion(e.value)}
              placeholder="Seleccione la sección"
            />
          {/* </div> */}
          {/* <div className="p-col-12 p-md-4"> */}
            <Dropdown
              value={materia}
              options={materias}
              onChange={(e) => setMateria(e.value)}
              placeholder="Seleccione la materia"
              disabled={!seccion}
            />
          {/* </div> */}
          {/* <div className="p-col-12 p-md-4" > */}
            <Calendar
              className="custom-calendar"
              value={fecha}
              onChange={(e) => setFecha(e.value)}
              placeholder="Seleccione la fecha"
              dateFormat="dd/mm/yy"
              locale="es"
            />
          {/* </div> */}
        </div>

        <div className="p-col-12 p-md-4" style={{marginTop: "1em", marginBottom: "1em", marginLeft: "1em", marginRight: "1em", maxWidth: "50%"}}>
          <label htmlFor="lecciones" style={{fontSize: "2em", fontWeight: "bold"}} >Cantidad de lecciones </label>
            <InputNumber
              id="lecciones"
              value={1}
              onChange={(e) => asignarLecciones(e.value)}
              placeholder="Cantidad de lecciones"
              min={1}
            />
        </div>

        <div className="button-row" >
          <Button
            label="Marcar todos como Presentes"
            className="p-button-success p-mr-2"
            onClick={() => marcarTodos("Presente")}
          />
          <Button
            label="Marcar todos como Ausentes"
            className="p-button-danger p-mr-2"
            onClick={() => marcarTodos("Ausente")}
          />
          <Button
            label="Marcar todos como Ausentes Justificados"
            className="p-button-warning"
            onClick={() => marcarTodos("Ausente Justificado")}
          />
          <Button
            label="Nueva Sesión de Asistencia"
            className="p-button-info"
            onClick={handleNuevaSesion}
            
          />
        </div>

        <div className="button-row" >
          {sesiones.map((sesion) => (
            <Button
              label={`Sesión ${sesion}`}
              className={`p-mr-2 ${sesion === sesionSeleccionada ? "p-button-primary" : "p-button-secondary"}`}
              onClick={() => handleSesionChange(sesion)}
              key={sesion}
            />
          ))}
        </div>
   
        <DataTable 
          value={estudiantesSesion} 
          className="p-mt-4" 
          stripedRows 
          emptyMessage="No hay estudiantes para mostrar"
        >
          <Column field="sesion" header="Sesión" />
          <Column field="nombre" header="Nombre" sortable />
          <Column
            field="estado"
            header="Tipo de Asistencia"
            body={(rowData) => (
              <Dropdown
                value={rowData.estado}
                options={[
                  { label: "Presente", value: "Presente" },
                  { label: "Ausente", value: "Ausente" },
                  { label: "Tardia", value: "Tardia"},
                  { label: "Ausente Justificado", value: "Ausente Justificado" },
                  { label: "N/R", value: "N/R" },
                ]}
                onChange={(e) => handleEstadoChange(rowData.id, e.value)}
                placeholder="Estado"
              />
            )}
          />
          <Column
            field = "lecciones"
            header = "Cantidad de Lecciones"
            body = {(rowData) => (
              <InputNumber
                value={rowData.lecciones}
                onChange={(e) => handleLeccionesChange(rowData.id, e.value)}
                placeholder="Cantidad de lecciones"
                min={1}
                
              />
            )}
          />
          <Column
            field="justificacion"
            header="Justificación"
            body={(rowData) =>
              rowData.estado === "Ausente Justificado" ? (
                <InputTextarea
                  style={{ width: "100%", height: "4.2rem", marginTop: "3%", fontSize: "1.2em" }}
                  type="text"
                  value={rowData.justificacion}
                  onChange={(e) =>
                    handleJustificacionChange(rowData.id, e.target.value)
                  }
                  placeholder="Motivo de la ausencia"
                />
              ) : null
            }
          />
        </DataTable>
        

        <div className="save-button-container">
          <Button
            style={{maxWidth: "50%", marginBottom: "1em"}}
            label="Guardar"
            className="p-button-primary"
            onClick={guardarAsistencia}
          />
        </div>

      </div>
    </div>
  );
};

export default Asistencia;