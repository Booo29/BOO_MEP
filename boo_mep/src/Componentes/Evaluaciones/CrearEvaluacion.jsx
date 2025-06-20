import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { addLocale } from 'primereact/api';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {PostEvaluaciones, GetEvaluacionIndicadoresNivelesById, PutEvaluacion} from '../../Servicios/EvaluacionService';

import useMateriaStore from '../../store/MateriaStore';
import useGradoStore from '../../store/GradoStore';
import usePeriodoStore from '../../store/PeriodoStore';
import useEvaluacionStore from '../../store/EvaluacionStore';

const CrearEvaluacion = () => {

    const navigate = useNavigate();

    const nombreMateria = useMateriaStore((state) => state.materiaNombre);
    const nombreGrado = useGradoStore((state) => state.gradoNombre);
    const periodoId = usePeriodoStore((state) => state.periodoId);
    const evaluacionId = useEvaluacionStore((state) => state.evaluacionId);

    const setEvaluacionId = useEvaluacionStore((state) => state.setEvaluacionId);

    const [evaluacion, setEvaluacion] = useState({
        nombre: '',
        puntos: '',
        porcentaje: '',
        fecha: null,
        indicadores: [],
        nivelesDesempeno: []
    });

    useEffect(() => {
        const fetchEvaluacion = async () => {
            if (evaluacionId) {
                try {
                    const response = await GetEvaluacionIndicadoresNivelesById(evaluacionId);
                    setEvaluacion({
                        ...evaluacion,
                        nombre: response[0].nombre,
                        puntos: response[0].puntos,
                        porcentaje: response[0].porcentaje,
                        fecha: new Date(response[0].fecha),
                        indicadores: response[0].indicadores,
                        nivelesDesempeno: response[0].NivelesDesempeno
                    });
                } catch (error) {
                    console.error('Error fetching evaluacion:', error);
                }
            }
        };
        fetchEvaluacion();
    }
    , [evaluacionId]);


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

    const handleInputChange = (e) => {
        setEvaluacion({
            ...evaluacion,
            [e.target.name]: e.target.value
        });
    };

    const handleDateChange = (e) => {
        setEvaluacion({
            ...evaluacion,
            fecha: e.value
        });
    };


    const handleSubmit = async (e) => {
        if (evaluacionId) {
            e.preventDefault();
            try {
                const updatedEvaluacion = {
                    Eva_Materia: nombreMateria,
                    Eva_Grado: nombreGrado,
                    Eva_Nombre: evaluacion.nombre,
                    Eva_Fecha: evaluacion.fecha.toISOString().split("T")[0],
                    Eva_Porcentaje: evaluacion.porcentaje,
                    Eva_Puntos: evaluacion.puntos,
                    Periodo_idPeriodo: periodoId
                };
                await PutEvaluacion(evaluacionId, updatedEvaluacion);
                
                Swal.fire({
                    title: 'Evaluación actualizada',
                    text: 'Deseas agregar indicadores y niveles de desempeño a la evaluación? Seleccione "Si" y luego la opción "Siguiente" o "No" para continuar',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Si',
                    cancelButtonText: 'No'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setEvaluacionId(evaluacionId);
                        
                    } else {
                        setEvaluacion({
                            nombre: '',
                            puntos: '',
                            porcentaje: '',
                            fecha: null,
                            indicadores: [],
                            nivelesDesempeno: []
                        });
                        setEvaluacionId(null);
                         navigate('/EvaluacionesPage');
                    }
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Ha ocurrido un error al actualizar la evaluación',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
            return;
        } else{
            e.preventDefault();
            try {
                const nuevaEvaluacion = {
                    Eva_Materia: nombreMateria,
                    Eva_Grado: nombreGrado,
                    Eva_Nombre: evaluacion.nombre,
                    Eva_Fecha: evaluacion.fecha.toISOString().split("T")[0],
                    Eva_Porcentaje: evaluacion.porcentaje,
                    Eva_Puntos: evaluacion.puntos,
                    Periodo_idPeriodo: periodoId
                };
                const response = await PostEvaluaciones(nuevaEvaluacion);
                
                Swal.fire({
                    title: 'Evaluación creada',
                    text: 'Deseas agregar indicadores y niveles de desempeño a la evaluación? Seleccione "Si" y luego la opción "Siguiente" o "No" para continuar',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Si',
                    cancelButtonText: 'No'
                }).then((result) => {
                    if (result.isConfirmed) {
                        setEvaluacionId(response.insertedIds[0]);
                        console.log('Evaluación creada con ID:', response.insertedIds[0]);
                    } else {
                       
                        setEvaluacion({
                            nombre: '',
                            puntos: '',
                            porcentaje: '',
                            fecha: null,
                            indicadores: [],
                            nivelesDesempeno: []
                        });

                         navigate('/EvaluacionesPage');
                    }
                });
            } catch (error) {
                Swal.fire({
                    title: 'Error',
                    text: 'Ha ocurrido un error al crear la evaluación',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });
            }
        }
        
    };


    return (
        <div className="p-grid p-fluid">
            <div className="p-col-12">
                <div className="card">
                    <h1>Información de la evaluación</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="p-field">
                            <label htmlFor="nombre" style={{fontWeight: "bold", fontSize: "25px"}}>Nombre</label>
                            <InputText id="nombre" name="nombre" value={evaluacion.nombre} onChange={handleInputChange} />
                        </div>
                        <div className="p-field">
                            <label htmlFor="puntos" style={{fontWeight: "bold", fontSize: "25px"}}>Puntos</label>
                            <InputText id="puntos" name="puntos" value={evaluacion.puntos} onChange={handleInputChange} />
                        </div>
                        <div className="p-field">
                            <label htmlFor="porcentaje" style={{fontWeight: "bold", fontSize: "25px"}}>Porcentaje</label>
                            <InputText id="porcentaje" name="porcentaje" value={evaluacion.porcentaje} onChange={handleInputChange} />
                        </div>
                        <div className="p-field">
                            <label htmlFor="fecha" style={{fontWeight: "bold", fontSize: "25px"}}>Fecha</label>
                            <Calendar id="fecha" name="fecha" value={evaluacion.fecha} onChange={handleDateChange} locale='es'/>
                        </div>
                        <button type="submit" className="p-button p-component p-button-text-icon-left">
                            <span className="p-button-icon-left pi pi-save"></span>
                            <span className="p-button-text">Guardar</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );

};

export default CrearEvaluacion;

