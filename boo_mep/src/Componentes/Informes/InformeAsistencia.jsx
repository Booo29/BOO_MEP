import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Calendar } from "primereact/calendar";
import Cookies from 'universal-cookie';
import { jwtDecode } from "jwt-decode";

import {GenerarDocumento} from './GenerarDocumento';

import {getGradoSecciones} from '../../Servicios/GradoSeccionService';
import {getEstudiantes} from '../../Servicios/EstudiantesService';
import {getInstitucionbyId} from '../../Servicios/InstitucionService';
import {GetInformeAsistenciaSeccion, GetInformeAsistenciaEstudiante, GetInformeNotasSeccion, GetInformeNotasEstudiante } from '../../Servicios/InformeService';

import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import usePeriodoStore from "../../store/PeriodoStore";

const InformeAsistencia = () => {

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
    console.log('selectedSeccion', selectedSeccion);
    if(selectedSeccion){
      const fetchEstudiantes = async () => {
        try{
          console.log('selectedSeccion', selectedSeccion);
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
      console.log('Seccion', secciones.find((seccion) => seccion.value === selectedSeccion).label);
      console.log('Institucion', institucion.Inst_Nombre);


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
        total_justificada: dato.Total_Ausente_Justificado,
        fechas_justificada: dato.Fechas_Ausente_Justificado ,
      }));

      GenerarDocumento('REPORTEASISTENCIAINDIVIDUAL.docx', datosInforme, 'Reporte de asistencia individual');
    }
    if(selectedReportType === 'InformeNotasGrupal'){
      const informe = await GetInformeNotasSeccion(selectedSeccion, periodoId);
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

  return (
    <div>
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
      />

      {selectedReportType && (
        <>
          <Dropdown 
            value={selectedSeccion} 
            options={secciones} 
            onChange={(e) => setSelectedSeccion(e.value)} 
            placeholder="Seleccione sección" 
          />
          
          {(selectedReportType === 'InformeAsistenciaIndividual' || selectedReportType === 'InformeNotasIndividual') && (
            <Dropdown 
              value={selectedEstudiante} 
              options={estudiantes} 
              onChange={(e) => setSelectedEstudiante(e.value)} 
              placeholder="Seleccione estudiantes"
              filter
            />
          )}

          {(selectedReportType === 'InformeAsistenciaGrupal' || selectedReportType === 'InformeAsistenciaIndividual') && (
            <div>
              <Calendar 
                value={startDate} 
                onChange={(e) => setStartDate(e.value)} 
                placeholder="Fecha de inicio" 
                showIcon 
              />
              <Calendar 
                value={endDate} 
                onChange={(e) => setEndDate(e.value)} 
                placeholder="Fecha de fin" 
                showIcon 
              />
            </div>
          )}

          <Button label="Generar Informe" onClick={handleReportGeneration} />
        </>
      )}
    </div>
  );
};

export default InformeAsistencia;
