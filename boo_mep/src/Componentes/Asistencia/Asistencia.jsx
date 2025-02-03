import React, { useState, useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { InputNumber } from "primereact/inputnumber";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
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
  const [asistencias, setAsistencias] = useState([]);

  const [seccion, setSeccion] = useState(null);
  const [materia, setMateria] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [lecciones, setLecciones] = useState(1);

  const toast = React.useRef(null);

  
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
              value: mat.Mat_Id,
            }))
          );
        } catch (error) {
          console.error("Error cargando materias:", error);
        }
      }
    };
    fetchMaterias();
  }, [seccion]);

  // Cargar estudiantes cuando se selecciona una materia
  // useEffect(() => {
  //   const fetchEstudiantes = async () => {
  //     if (materia) {
  //       try {
  //         console.log("Id seccion ", seccion);
  //         const response = await getEstudiantes(4, seccion);
  //         setEstudiantes(
  //           response.map((est) => ({
  //             id: est.Est_Identificacion,
  //             idEstudiante: est.Est_Id,
  //             nombre: `${est.Est_Nombre} ${est.Est_PrimerApellido} ${est.Est_SegundoApellido}`,
  //             estado: "Presente",
  //             justificacion: "",
  //           }))
  //         );
  //       } catch (error) {
  //         console.error("Error cargando estudiantes:", error);
  //       }
  //     }
  //   };
  //   fetchEstudiantes();
  // }, [materia]);

  //Cargar asistencias cuando se selecciona una materia y fecha
  // useEffect(() => {
  //   const fetchAsistencias = async () => {
  //     if (materia && fecha) {
  //       try {
  //         const response = await getAsistencia(7, materia, 9, fecha.toISOString().split("T")[0]);
  //         const estudiantesAsistencia = response.map((est) => ({
  //           id: est.Est_Identificacion,
  //           idEstudiante: est.Est_Id,
  //           nombre: `${est.Est_Nombre} ${est.Est_PrimerApellido} ${est.Est_SegundoApellido}`,
  //           estado: est.Asi_Asistencia,
  //           justificacion: est.Asi_Justificacion,
  //           asistenciaId: est.Asi_Id,
  //         }));
  //         setEstudiantes(estudiantesAsistencia);
  //         setAsistencias(response);
  //       } catch (error) {
  //         console.error("Error cargando asistencias:", error);
  //       }
  //     }
  //   };
  //   fetchAsistencias();
  // }, [materia, fecha]);


    // Cargar estudiantes y asistencias cuando se selecciona una materia y fecha
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
              estado: "Presente", // Valor por defecto
              justificacion: "", // Valor por defecto
            }));
  
            // Obtener asistencias
            const asistenciasResponse = await getAsistencia(periodoId, materia, seccion, fecha.toISOString().split("T")[0]);
            const asistenciasData = asistenciasResponse;
  
            // Combinar estudiantes con asistencias
            const estudiantesConAsistencias = estudiantesData.map((est) => {
              const asistencia = asistenciasData.find(
                (asi) => asi.Est_Identificacion === est.id
              );
              return {
                ...est,
                estado: asistencia ? asistencia.Asi_Asistencia : "Presente",
                justificacion: asistencia ? asistencia.Asi_Justificacion : "",
                asistenciaId: asistencia ? asistencia.Asi_Id : null, // ID de la asistencia (si existe)
              };
            });
  
            setEstudiantes(estudiantesConAsistencias);
          } catch (error) {
            console.error("Error cargando estudiantes o asistencias:", error);
          }
        }
      };
      fetchEstudiantesYAsistencias();
    }, [materia, fecha]);

  const handleEstadoChange = (id, estado) => {
    const nuevosEstudiantes = estudiantes.map((est) =>
      est.id === id ? { ...est, estado } : est
    );
    
    setEstudiantes(nuevosEstudiantes);
  };

  const handleJustificacionChange = (id, justificacion) => {
    const nuevosEstudiantes = estudiantes.map((est) =>
      est.id === id ? { ...est, justificacion } : est
    );
    setEstudiantes(nuevosEstudiantes);
  };

  const marcarTodos = (estado) => {
    const nuevosEstudiantes = estudiantes.map((est) => ({
      ...est,
      estado,
      justificacion: estado === "Ausente Justificado" ? "" : est.justificacion,
    }));
    setEstudiantes(nuevosEstudiantes);
  };

  const guardarAsistencia = async () => {
    try {
      const asistenciasNuevas = [];
      const asistenciasActualizar = [];

      estudiantes.forEach((est) => {
      const payload = {
        Asi_Fecha: fecha.toISOString().split("T")[0],
        Asi_Leccion: lecciones,
        Asi_Asistencia: est.estado,
        Asi_Justificacion: est.justificacion,
        Materia_grado_seccion_Mat_gra_sec_Id: materia,
        Estudiantes_Est_Id: est.idEstudiante,
        Periodo_Per_Id: periodoId, 
      };

      if (est.asistenciaId) {

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
            />
          {/* </div> */}
        </div>

        <div className="p-col-12 p-md-4" style={{marginTop: "1em", marginBottom: "1em", marginLeft: "1em", marginRight: "1em", maxWidth: "50%"}}>
          <label htmlFor="lecciones" style={{fontSize: "2em", fontWeight: "bold"}} >Cantidad de lecciones</label>
            <InputNumber
              value={lecciones}
              onValueChange={(e) => setLecciones(e.value)}
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
        </div>

        <DataTable value={estudiantes} className="p-mt-4" stripedRows emptyMessage="No hay estudiantes para mostrar">
          <Column field="nombre" header="Nombre" />
          <Column
            field="estado"
            header="Tipo de Asistencia"
            body={(rowData) => (
              <Dropdown
                value={rowData.estado}
                options={[
                  { label: "Presente", value: "Presente" },
                  { label: "Ausente", value: "Ausente" },
                  { label: "Ausente Justificado", value: "Ausente Justificado" },
                ]}
                onChange={(e) => handleEstadoChange(rowData.id, e.value)}
                placeholder="Estado"
              />
            )}
          />
          <Column
            field="justificacion"
            header="Justificación"
            body={(rowData) =>
              rowData.estado === "Ausente Justificado" ? (
                <input
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