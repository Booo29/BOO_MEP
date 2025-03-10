import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from "primereact/calendar";
import { addLocale } from 'primereact/api';
import Cookies from 'universal-cookie';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';

import {GenerarDocumento} from './GenerarDocumento';

import {getGradoSecciones} from '../../Servicios/GradoSeccionService';
import {getEstudiantes} from '../../Servicios/EstudiantesService';
import {getInstitucionbyId} from '../../Servicios/InstitucionService';
import {GetInformeAsistenciaSeccion, GetInformeAsistenciaEstudiante, GetInformeNotasSeccion, GetInformeNotasEstudiante } from '../../Servicios/InformeService';

import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import usePeriodoStore from "../../store/PeriodoStore";

const InformeAsistencia = () => {

  const navigate = useNavigate();

  const cookies = new Cookies();  

  const cicloId = useCicloStore((state) => state.cicloId);
  const institutionId = useStore((state) => state.institutionId);
  const periodoId = usePeriodoStore((state) => state.periodoId);

  const [institucion, setInstitucion] = useState(null);
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
      const datosInforme = {
        fechaHoy : new Date().toISOString().split("T")[0],
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
      };

      datosInforme.datos = informe.map((dato) => ({
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
      }));

      GenerarDocumento('REPORTEASISTENCIAGRUPAL.docx', datosInforme, 'Reporte de asistencia grupal');
    }
    if(selectedReportType === 'InformeAsistenciaIndividual'){
      const informe = await GetInformeAsistenciaEstudiante(selectedSeccion, selectedEstudiante, startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]);
      const datosInforme = {
        fechaHoy : new Date().toISOString().split("T")[0],
        nombre: `${informe[0].Est_Nombre} ${informe[0].Est_PrimerApellido} ${informe[0].Est_SegundoApellido}`,
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
      };

      datosInforme.datos = informe.map((dato) => ({
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
      }));

      GenerarDocumento('REPORTEASISTENCIAINDIVIDUAL.docx', datosInforme, 'Reporte de asistencia individual');
    }
    if(selectedReportType === 'InformeNotasGrupal'){
      const informe = await GetInformeNotasSeccion(selectedSeccion, periodoId);

      const estudiantesMap = new Map();

      informe.forEach((dato) => {
        if (!estudiantesMap.has(dato.Est_Identificacion)) {
          estudiantesMap.set(dato.Est_Identificacion, {
            identificacion: dato.Est_Identificacion,
            nombre: `${dato.Est_Nombre} ${dato.Est_PrimerApellido} ${dato.Est_SegundoApellido}`,
            materias: [],
          });
        }

        estudiantesMap.get(dato.Est_Identificacion).materias.push({
          materia: dato.Materia,
          evaluacion: dato.Evaluacion,
          porcentaje_evaluacion: dato.Porcentaje_Evaluacion,
          puntos_evaluacion: dato.Puntos_Evaluacion,
          porcentaje_obtenido: dato.Porcentaje_Obtenido,
          puntos_obtenidos: dato.Puntos_Obtenidos,
          nota: dato.Nota_Final,
        });
      });

      const datosInforme = {
        fechaHoy: new Date().toISOString().split("T")[0],
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
        datos: Array.from(estudiantesMap.values()), // Convertir Map a Array
      };


      // const datosInforme = {
      //   fechaHoy : new Date().toISOString().split("T")[0],
      //   nombre: `${informe[0].Est_Nombre} ${informe[0].Est_PrimerApellido} ${informe[0].Est_SegundoApellido}`,
      //   seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
      //   institucion: institucion.Inst_Nombre,
      //   profesor: `${jwtDecode(cookies.get("token")).profesor}`,
      // };

      // datosInforme.datos = informe.map((dato) => ({
      //   identificacion: dato.Est_Identificacion,
      //   nombre: `${dato.Est_Nombre} ${dato.Est_PrimerApellido} ${dato.Est_SegundoApellido}`,
      //   materia: dato.Materia,
      //   evaluacion: dato.Evaluacion,
      //   porcentaje_evaluacion: dato.Porcentaje_Evaluacion,
      //   puntos_evaluacion: dato.Puntos_Evaluacion,
      //   porcentaje_obtenido: dato.Porcentaje_Obtenido,
      //   puntos_obtenidos: dato.Puntos_Obtenidos,
      //   nota: dato.Nota_Final,
      // }));

      GenerarDocumento('REPORTENOTAGRUPAL.docx', datosInforme, 'Reporte de notas grupal');

    }
    if(selectedReportType === 'InformeNotasIndividual'){
      const informe = await GetInformeNotasEstudiante(selectedEstudiante, selectedSeccion, periodoId);
      const datosInforme = {
        fechaHoy : new Date().toISOString().split("T")[0],
        nombre: `${informe[0].Est_Nombre} ${informe[0].Est_PrimerApellido} ${informe[0].Est_SegundoApellido}`,
        seccion: secciones.find((seccion) => seccion.value === selectedSeccion).label,
        institucion: institucion.Inst_Nombre,
        profesor: `${jwtDecode(cookies.get("token")).profesor}`,
      };

      datosInforme.datos = informe.map((dato) => ({
        identificacion: dato.Est_Identificacion,
        nombre: `${dato.Est_Nombre} ${dato.Est_PrimerApellido} ${dato.Est_SegundoApellido}`,
        materia: dato.Materia,
        evaluacion: dato.Evaluacion,
        porcentaje_evaluacion: dato.Porcentaje_Evaluacion,
        puntos_evaluacion: dato.Puntos_Evaluacion,
        porcentaje_obtenido: dato.Porcentaje_Obtenido,
        puntos_obtenidos: dato.Puntos_Obtenidos,
        nota: dato.Nota_Final,
      }));

      GenerarDocumento('REPORTENOTASINDIVIDUAL.docx', datosInforme, 'Reporte de notas individual');
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
            ]}
            onChange={(e) => setSelectedReportType(e.value)}
            placeholder="Seleccione tipo de informe"
            style={{ width: "100%", fontSize: '16px', fontWeight: 'bold' }}
          />
        </div>
      </div>
      {selectedReportType && (
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
