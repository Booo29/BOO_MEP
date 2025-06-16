import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Calendar } from "primereact/calendar";
import { addLocale } from 'primereact/api';
import Cookies from 'universal-cookie';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

import {GenerarDocumento} from './GenerarDocumento';

import {getPeriodo} from '../../Servicios/PeriodoService';
import {getGradoSecciones} from '../../Servicios/GradoSeccionService';
import {getEstudiantes} from '../../Servicios/EstudiantesService';
import {getInstitucionbyId} from '../../Servicios/InstitucionService';
import {GetInformeAsistenciaSeccion, GetInformeAsistenciaEstudiante, GetInformeNotasSeccion, GetInformeNotasEstudiante, GetAsistenciaTotalEstudiante, GetAsistenciaTotalSeccion } from '../../Servicios/InformeService';

import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import usePeriodoStore from "../../store/PeriodoStore";

const InformeAsistencia = () => {

  const tablaMEP = [
    { min: 0, max: 1, asistencia: 10 },
    { min: 1, max: 10, asistencia: 9 },
    { min: 10, max: 20, asistencia: 8 },
    { min: 20, max: 30, asistencia: 7 },
    { min: 30, max: 40, asistencia: 6 },
    { min: 40, max: 50, asistencia: 5 }, 
    { min: 50, max: 60, asistencia: 4 },
    { min: 60, max: 70, asistencia: 3 },
    { min: 70, max: 80, asistencia: 2 },
    { min: 80, max: 90, asistencia: 1 },
    { min: 90, max: 100, asistencia: 0 }
  ];

  const navigate = useNavigate();

  const cookies = new Cookies();  

  const cicloId = useCicloStore((state) => state.cicloId);
  const institutionId = useStore((state) => state.institutionId);
  const periodoId = usePeriodoStore((state) => state.periodoId);

  const [institucion, setInstitucion] = useState(null);
  const [periodo, setPeriodo] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [secciones, setSecciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedSeccion, setSelectedSeccion] = useState(null);
  const [selectedEstudiante, setSelectedEstudiante] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
        try{
          const secciones = await getGradoSecciones(cicloId, institutionId);
          const institucion = await getInstitucionbyId(institutionId);
          setInstitucion(institucion);
          setSecciones(
            secciones.map((seccion) => ({
              label: `${seccion.Gra_Nombre} - ${seccion.Gra_Sec_Nombre}`,
              value: seccion.Id_Grado_Seccion,
            }))
          );
          const periodoInicial = await getPeriodo(periodoId);
          setPeriodo(periodoInicial);

        } catch (error) {
          console.error('Error al cargar las secciones', error);
        }
      }
      fetchSecciones();
    
  }, []);

  useEffect(() => {
    if(selectedSeccion){
      const fetchEstudiantes = async () => {
        try{
          const estudiantes = await getEstudiantes(cicloId, selectedSeccion);
          setEstudiantes(
            estudiantes.map((estudiante) => ({
              label: `${estudiante.Est_Nombre} ${estudiante.Est_PrimerApellido} ${estudiante.Est_SegundoApellido}`,
              value: estudiante.Est_Id,
            }))
          );
        } catch (error) {
          console.error('Error al cargar los estudiantes', error);
        }
      }
      fetchEstudiantes();
    }
  }
  , [secciones, selectedSeccion]);

  const handleReportGeneration = async () => {

    if(selectedReportType === 'InformeAsistenciaGrupal'){
      const informe = await GetInformeAsistenciaSeccion(selectedSeccion, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);

      const totalAsistencia = await GetAsistenciaTotalSeccion(selectedSeccion, periodoId);

      const asistenciaPorEstudiante = new Map();
      totalAsistencia.forEach(dato => {
          const totalClases = dato.Total_Presente + dato.Total_Ausente + dato.Total_Ausente_Justificado;
          const porcentajeAusencias = totalClases > 0 ? Math.round((dato.Total_Ausente / totalClases) * 100 ): 0;
          const porcentajeAsistencia = tablaMEP.find(rango => porcentajeAusencias >= rango.min && porcentajeAusencias < rango.max)?.asistencia || 0;
          asistenciaPorEstudiante.set(dato.Est_Identificacion, { porcentajeAsistencia, porcentajeAusencias });
      });

      const datosInforme = {
        fechaHoy: new Date().toISOString().split("T")[0],
        seccion: secciones.find(seccion => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
        datos: informe.map(dato => {
            const asistencia = asistenciaPorEstudiante.get(dato.Est_Identificacion) || { porcentajeAsistencia: 0, porcentajeAusencias: 0 };
            return {
                identificacion: dato.Est_Identificacion,
                nombre: `${dato.Est_Nombre} ${dato.Est_PrimerApellido} ${dato.Est_SegundoApellido}`,
                materia: dato.Mat_Nombre,
                total_presente: dato.Total_Presente,
                fechas_presente: dato.Fechas_Presente,
                total_ausente: dato.Total_Ausente,
                fechas_ausente: dato.Fechas_Ausente,
                total_tardia: dato.Total_Tarde,
                fechas_tardia: dato.Fechas_Tarde,
                total_justificada: dato.Total_Ausente_Justificado,
                fechas_justificada: dato.Fechas_Ausente_Justificado,
                porcentaje_asistencia: asistencia.porcentajeAsistencia,
                porcentaje_ausencia: asistencia.porcentajeAusencias,
            };
        }),
      };

      GenerarDocumento('REPORTEASISTENCIAGRUPAL.docx', datosInforme, `Reporte de asistencia grupal - ${secciones.find((seccion) => seccion.value === selectedSeccion).label}`);
    }
    if(selectedReportType === 'InformeAsistenciaIndividual'){
      const informe = await GetInformeAsistenciaEstudiante(selectedSeccion, selectedEstudiante, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);
      
      const totalAsistencia = await GetAsistenciaTotalEstudiante(selectedEstudiante, selectedSeccion, periodoId);

      const totalClases = totalAsistencia[0].Total_Presente + totalAsistencia[0].Total_Ausente + totalAsistencia[0].Total_Ausente_Justificado;
      const porcentajeAusencias = totalClases > 0 ? Math.round((totalAsistencia[0].Total_Ausente / totalClases) * 100) : 0;
      const porcentajeAsistencia = tablaMEP.find(rango => porcentajeAusencias >= rango.min && porcentajeAusencias < rango.max)?.asistencia || 0;
      
      const datosInforme = {
        fechaHoy : new Date().toISOString().split("T")[0],
        nombre: `${informe[0].Est_Nombre} ${informe[0].Est_PrimerApellido} ${informe[0].Est_SegundoApellido}`,
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
      };

      datosInforme.datos = informe.map((dato) => {


        return {
          identificacion: dato.Est_Identificacion,
          nombre: `${dato.Est_Nombre} ${dato.Est_PrimerApellido} ${dato.Est_SegundoApellido}`,
          materia: dato.Mat_Nombre,
          total_presente: dato.Total_Presente,
          fechas_presente: dato.Fechas_Presente,
          total_ausente: dato.Total_Ausente,
          fechas_ausente: dato.Fechas_Ausente,
          total_tardia: dato.Total_Tarde,
          fechas_tardia: dato.Fechas_Tarde,
          total_justificada: dato.Total_Ausente_Justificado,
          fechas_justificada: dato.Fechas_Ausente_Justificado ,
          porcentaje_asistencia: porcentajeAsistencia,
          porcentaje_ausencia: porcentajeAusencias,
        }

        });


      GenerarDocumento('REPORTEASISTENCIAINDIVIDUAL.docx', datosInforme, `Reporte de asistencia individual - ${informe[0].Est_Nombre} ${informe[0].Est_PrimerApellido} ${informe[0].Est_SegundoApellido} - ${secciones.find((seccion) => seccion.value === selectedSeccion).label}`);
    }
    if(selectedReportType === 'InformeNotasGrupal'){

      const informe = await GetInformeNotasSeccion(selectedSeccion, periodoId);

      const totalAsistencia = await GetAsistenciaTotalSeccion(selectedSeccion, periodoId);

      const estudiantesMap = new Map();

      const asistenciaPorEstudianteMateria = new Map();

      totalAsistencia.forEach((dato) => {
        const totalClases = dato.Total_Presente + dato.Total_Ausente + dato.Total_Ausente_Justificado;
        const porcentajeAusencias = totalClases > 0 ? (dato.Total_Ausente / totalClases) * 100 : 0;
        const porcentajeAsistencia = tablaMEP.find(rango => porcentajeAusencias >= rango.min && porcentajeAusencias < rango.max)?.asistencia || 0;

        if (!asistenciaPorEstudianteMateria.has(dato.Est_Identificacion)) {
            asistenciaPorEstudianteMateria.set(dato.Est_Identificacion, new Map());
        }
        asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).set(dato.Mat_Nombre, porcentajeAsistencia);
      });

      informe.forEach((dato) => {
        if (!estudiantesMap.has(dato.Est_Identificacion)) {
          estudiantesMap.set(dato.Est_Identificacion, {
            identificacion: dato.Est_Identificacion,
            nombre: `${dato.Est_Nombre} ${dato.Est_PrimerApellido} ${dato.Est_SegundoApellido}`,
            materias: new Map(),
           // total_porcentaje: 0,
          });
        }

        const estudiante = estudiantesMap.get(dato.Est_Identificacion);

        if (!estudiante.materias.has(dato.Materia)) {
          estudiante.materias.set(dato.Materia, {
            materia: dato.Materia,
            porcentaje_asistencia: asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).get(dato.Materia) || 0,
            evaluaciones: [],
            total_porcentaje: 0,
          });
      
          // Sumar asistencia solo una vez por materia
          estudiante.materias.get(dato.Materia).total_porcentaje = asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).get(dato.Materia) || 0;
          //estudiante.total_porcentaje += asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).get(dato.Materia) || 0;
        }
      
        estudiante.materias.get(dato.Materia).evaluaciones.push({
          evaluacion: dato.Evaluacion,
          porcentaje_evaluacion: dato.Porcentaje_Evaluacion,
          puntos_evaluacion: dato.Puntos_Evaluacion,
          porcentaje_obtenido: dato.Porcentaje_Obtenido,
          puntos_obtenidos: dato.Puntos_Obtenidos,
          nota: dato.Nota_Final,
          });
        // Sumar el porcentaje obtenido a la materia
        estudiante.materias.get(dato.Materia).total_porcentaje += dato.Porcentaje_Obtenido;
          //estudiante.total_porcentaje += dato.Porcentaje_Obtenido;
        });

      const datosInforme = {
        fechaHoy: new Date().toISOString().split("T")[0],
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
        datos: Array.from(estudiantesMap.values()).map(est => ({
          ...est,
          materias: Array.from(est.materias.values()),
        })),
      };

      GenerarDocumento('REPORTENOTAGRUPAL.docx', datosInforme, `Reporte de notas grupal - ${secciones.find((seccion) => seccion.value === selectedSeccion).label}`);

    }
    if(selectedReportType === 'InformeNotasIndividual'){
      const informe = await GetInformeNotasEstudiante(selectedEstudiante, selectedSeccion, periodoId);

      const totalAsistencia = await GetAsistenciaTotalEstudiante(selectedEstudiante, selectedSeccion, periodoId);

      const asistenciaPorMateria = new Map();
    

      totalAsistencia.forEach((dato) => {
        if (dato.Est_Id === selectedEstudiante) {
          const totalClases = dato.Total_Presente + dato.Total_Ausente + dato.Total_Ausente_Justificado;
          const porcentajeAusencias = totalClases > 0 ? (dato.Total_Ausente / totalClases) * 100 : 0;
          const porcentajeAsistencia = tablaMEP.find(rango => porcentajeAusencias >= rango.min && porcentajeAusencias < rango.max)?.asistencia || 0;
          
          asistenciaPorMateria.set(dato.Mat_Nombre, porcentajeAsistencia);
        }
      });
    
      const estudiante = {
        identificacion: informe[0].Est_Identificacion,
        nombre: `${informe[0].Est_Nombre} ${informe[0].Est_PrimerApellido} ${informe[0].Est_SegundoApellido}`,
        materias: new Map(),
        //total_porcentaje: 0,
      };
    
      informe.forEach((dato) => {
        if (!estudiante.materias.has(dato.Materia)) {
          estudiante.materias.set(dato.Materia, {
            materia: dato.Materia,
            porcentaje_asistencia: asistenciaPorMateria.get(dato.Materia) || 0,
            evaluaciones: [],
            total_porcentaje: 0,
          });
          // Sumar asistencia solo una vez por materia
          estudiante.materias.get(dato.Materia).total_porcentaje = asistenciaPorMateria.get(dato.Materia) || 0;
    
          //estudiante.total_porcentaje += asistenciaPorMateria.get(dato.Materia) || 0;
        }
    
      
        estudiante.materias.get(dato.Materia).evaluaciones.push({
          evaluacion: dato.Evaluacion,
          porcentaje_evaluacion: dato.Porcentaje_Evaluacion,
          puntos_evaluacion: dato.Puntos_Evaluacion,
          porcentaje_obtenido: dato.Porcentaje_Obtenido,
          puntos_obtenidos: dato.Puntos_Obtenidos,
          nota: dato.Nota_Final,
        });
        // Sumar el porcentaje obtenido a la materia
        estudiante.materias.get(dato.Materia).total_porcentaje += dato.Porcentaje_Obtenido;
        //estudiante.total_porcentaje += dato.Porcentaje_Obtenido;
        
      });
    
      const datosInforme = {
        fechaHoy: new Date().toISOString().split("T")[0],
        nombre: estudiante.nombre,
        identificacion: estudiante.identificacion,
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
        materias: Array.from(estudiante.materias.values()),
        //total_porcentaje: estudiante.total_porcentaje.toFixed(2), 
      };

      GenerarDocumento('REPORTENOTASINDIVIDUAL.docx', datosInforme, `Reporte de notas individual - ${estudiante.nombre} - ${secciones.find((seccion) => seccion.value === selectedSeccion).label}`);
    }
    if(selectedReportType === 'InformeConcentrados'){

      const datosInformePorSeccion = [];

      for (const seccion of secciones) {
        const selectedSeccion = seccion.value;

        const informe = await GetInformeNotasSeccion(selectedSeccion, periodoId);
        const totalAsistencia = await GetAsistenciaTotalSeccion(selectedSeccion, periodoId);

        const estudiantesMap = new Map();
        const asistenciaPorEstudianteMateria = new Map();

        totalAsistencia.forEach((dato) => {
          const totalClases = dato.Total_Presente + dato.Total_Ausente + dato.Total_Ausente_Justificado;
          const porcentajeAusencias = totalClases > 0 ? (dato.Total_Ausente / totalClases) * 100 : 0;
          const porcentajeAsistencia = tablaMEP.find(rango => porcentajeAusencias >= rango.min && porcentajeAusencias < rango.max)?.asistencia || 0;

          if (!asistenciaPorEstudianteMateria.has(dato.Est_Identificacion)) {
              asistenciaPorEstudianteMateria.set(dato.Est_Identificacion, new Map());
          }
          asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).set(dato.Mat_Nombre, porcentajeAsistencia);
        });

        informe.forEach((dato) => {
          if (!estudiantesMap.has(dato.Est_Identificacion)) {
            estudiantesMap.set(dato.Est_Identificacion, {
              identificacion: dato.Est_Identificacion,
              nombre: dato.Est_Nombre,
              primerApellido: dato.Est_PrimerApellido,
              segundoApellido: dato.Est_SegundoApellido,
              materias: new Map(),
            });
          }

          const estudiante = estudiantesMap.get(dato.Est_Identificacion);

          if (!estudiante.materias.has(dato.Materia)) {
            estudiante.materias.set(dato.Materia, {
              materia: dato.Materia,
              porcentaje_asistencia: asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).get(dato.Materia) || 0,
              evaluaciones: [],
              total_porcentaje: 0,
              condicion: '',
            });

            estudiante.materias.get(dato.Materia).total_porcentaje = asistenciaPorEstudianteMateria.get(dato.Est_Identificacion).get(dato.Materia) || 0;
          }

          estudiante.materias.get(dato.Materia).evaluaciones.push({});
          estudiante.materias.get(dato.Materia).total_porcentaje += dato.Porcentaje_Obtenido;
          estudiante.materias.get(dato.Materia).condicion = estudiante.materias.get(dato.Materia).total_porcentaje >= 65 ? 'Aprobado' : 'Reprobado';
        });

        const materiasMap = new Map();

        estudiantesMap.forEach(estudiante => {
          estudiante.materias.forEach(materia => {
            if (!materiasMap.has(materia.materia)) {
              materiasMap.set(materia.materia, []);
            }

            materiasMap.get(materia.materia).push({
              primerApellido: estudiante.primerApellido,
              segundoApellido: estudiante.segundoApellido,
              nombre: estudiante.nombre,
              identificacion: estudiante.identificacion,
              total_porcentaje: materia.total_porcentaje,
              condicion: materia.condicion,
            });
          });
        });

        datosInformePorSeccion.push({
          año: new Date().getFullYear(),
          seccion: seccion.label,
          docente: `${jwtDecode(cookies.get("token")).profesor}`,
          periodo: periodo.Per_Nombre,
          materias: Array.from(materiasMap.entries()).map(([materia, estudiantes]) => ({
            materia,
            estudiantes
          })),
        });
    
    };

      const datosInforme = {
          institucion: institucion.Inst_Nombre,
          secciones: datosInformePorSeccion,
      };

      GenerarDocumento('CONCENTRADOS.docx', datosInforme, `Reporte concentrado - ${institucion.Inst_Nombre}`);
    }

  };

  const handleMenu = () => {
    navigate('/MenuPage');
  };


  return (
    <div style={{ padding: "16px" }} >
      <Button label="Regresar" severity="help" onClick={handleMenu} />
      <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Creador de informes</h1>
      <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}> 
          <Dropdown 
            value={selectedReportType} 
            options={[
              { label: 'Informe de Asistencia Grupal', value: 'InformeAsistenciaGrupal' },
              { label: 'Informe de Asistencia Individual', value: 'InformeAsistenciaIndividual' },
              { label: 'Informe de Notas Grupal', value: 'InformeNotasGrupal' },
              { label: 'Informe de Notas Individual', value: 'InformeNotasIndividual' },
              { label: 'Informe de Concentrados', value: 'InformeConcentrados' },
            ]}
            onChange={(e) => setSelectedReportType(e.value)}
            placeholder="Seleccione tipo de informe"
            style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
          />
        </div>
      </div>
      {(selectedReportType === 'InformeAsistenciaIndividual' || selectedReportType === 'InformeNotasIndividual' || selectedReportType === 'InformeNotasGrupal' || selectedReportType === 'InformeAsistenciaGrupal') && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}> 
          <Dropdown 
            value={selectedSeccion} 
            options={secciones} 
            onChange={(e) => setSelectedSeccion(e.value)} 
            placeholder="Seleccione sección" 
            style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
          />
        </div>
      </div>
      )}

          {(selectedReportType === 'InformeAsistenciaIndividual' || selectedReportType === 'InformeNotasIndividual') && (
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <Dropdown 
                value={selectedEstudiante} 
                options={estudiantes} 
                onChange={(e) => setSelectedEstudiante(e.value)} 
                placeholder="Seleccione estudiantes"
                filter
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
              />
            </div>
          </div>
          )}

          {(selectedReportType === 'InformeAsistenciaGrupal' || selectedReportType === 'InformeAsistenciaIndividual') && (
            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
       
            <div style={{ flex: 1 }}>
              <Calendar 
                value={startDate} 
                onChange={(e) => setStartDate(e.value)} 
                placeholder="Fecha de inicio" 
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}      
                locale='es'
              />
            </div>

            <div style={{ flex: 1 }}>
              <Calendar 
                value={endDate} 
                onChange={(e) => setEndDate(e.value)} 
                placeholder="Fecha de fin" 
                style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}    
                locale='es'
              />
            </div>
          </div>
          )}

          <div>
            <Button 
              label="Generar Informe" 
              severity="success"
              style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}    
              onClick={handleReportGeneration} 
              disabled={!selectedReportType}
            />
          </div>
      </div>
    

  );
};

export default InformeAsistencia;
