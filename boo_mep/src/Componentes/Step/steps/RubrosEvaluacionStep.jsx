import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import Swal from "sweetalert2";
import {getPeriodos} from '../../../Servicios/PeriodoService';
import {getMateriasByCiclo} from '../../../Servicios/MateriaService';
import {getGradoSeccionesMateria} from '../../../Servicios/GradoSeccionMateriaService';
import {getRubros, postRubros, postRubrosConfigurados} from '../../../Servicios/RubrosService';

import useCicloStore from "../../../store/CicloStore";

const RubrosEvaluacionStep = () => {

    const cicloId = useCicloStore((state) => state.cicloId);

    const [periodos, setPeriodos] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [grados, setGrados] = useState([]);

    const [rubros, setRubros] = useState([]);
    const [rubrosDisponibles, setRubrosDisponibles] = useState([]);

    const [periodosDisponibles, setPeriodosDisponibles] = useState([]);

    const [materiasDisponibles, setMateriasDisponibles] = useState([]);

    const [gradosDisponibles, setGradosDisponibles] = useState([]);

    const [datosInsertados, setDatosInsertados] = useState([]);

    const [showDialog, setShowDialog] = useState(false);
    const [nuevoRubro, setNuevoRubro] = useState({ nombre: "", porcentaje: 0 });

    useEffect(() => {

        const fetchData = async () => {
            try {
                const periodos = await getPeriodos(cicloId);
                setPeriodosDisponibles(periodos.map(p => ({ label: p.Per_Nombre, value: p.Per_Id })));

                const materias = await getMateriasByCiclo(cicloId);
                setMateriasDisponibles(materias.map(m => ({ label: m.Mat_Nombre, value: m.Mat_Nombre })));

                const grados = await getGradoSeccionesMateria(cicloId);
                const gradosUnicos = Array.from(new Map(grados.map(g => [g.grado_nombre, g])).values());
                setGradosDisponibles(gradosUnicos.map(g => ({
                    label: g.grado_nombre,
                    value: g.grado_nombre,
                    ids: grados.filter(gg => gg.grado_nombre === g.grado_nombre).map(gg => gg.materia_grado_seccion_id)
                })));

                const rubros = await getRubros();
                setRubrosDisponibles(rubros.map(r => ({ label: `${r.Rub_Nombre} (${r.Rub_Porcentaje}%)`, value: r })));
            } catch (error) {
                console.error("Error al obtener datos:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error al obtener datos",
                    text: "Ocurrió un error al obtener los datos necesarios para la configuración de rubros.",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        };

        fetchData();

    }, []);

    // Agregar nuevo rubro
    const agregarRubro = async () => {
        try {
            const nuevo = await postRubros({
                Rub_Nombre: nuevoRubro.nombre,
                Rub_Porcentaje: nuevoRubro.porcentaje,
            });

            setRubrosDisponibles(prev => [
                ...prev,
                { label: `${nuevo.Rub_Nombre} (${nuevo.Rub_Porcentaje}%)`, value: nuevo },
            ]);
            setShowDialog(false);
             Swal.fire({
                icon: "success",
                title: "Rubro agregado con exito",
                text: "El rubro se ha guardado correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error al agregar rubro:", error);
            Swal.fire({
                icon: "error",
                title: "Error al agregar rubro",
                text: "Hubo un error al agregar el rubro. Por favor, intenta de nuevo.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    const insertarDatos = () => {
        if (periodos.length === 0 || materias.length === 0 || grados.length === 0 || rubros.length === 0) {
            Swal.fire({
                icon: "warning",
                title: "Datos incompletos",
                text: "Por favor, seleccione todos los datos antes de insertar.",
                timer: 2000,
                showConfirmButton: false,
            });
            return;
        }

        const nuevosDatos = grados.map(g => materias.map(m => rubros.map(r => ({
            periodo: periodos[0],
            materia: m,
            grado: g,
            rubro: r,
        })))).flat(2);

        setDatosInsertados(prev => [...prev, ...nuevosDatos]);
        
        setPeriodos([]);
        setMaterias([]);
        setGrados([]);
        setRubros([]);
    };

    const agruparDatos = () => {
        return datosInsertados.reduce((acc, curr) => {
            const key = `${curr.materia}-${curr.grado}`;
            if (!acc[key]) {
                acc[key] = {
                    materia: curr.materia,
                    grado: curr.grado,
                    periodo: curr.periodo,
                    rubros: [],
                };
            }
            acc[key].rubros.push(curr.rubro);
            return acc;
        }, {});
    };

    const grupos = agruparDatos();

    const guardarDatos = async () => {
        try {
            const payload = datosInsertados.map(d => ({
                Rubros_Evaluacion_Rub_Id: d.rubro.Rub_Id,
                Periodo_Per_Id: d.periodo,
                Rub_Grado: d.grado,
                Rub_Materia: d.materia
            }));
            postRubrosConfigurados(payload);
            Swal.fire({
                icon: "success",
                title: "Datos guardados",
                text: "Los datos se han guardado correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });
            setDatosInsertados([]);
        } catch (error) {
            console.error("Error al guardar datos:", error);
            Swal.fire({
                icon: "error",
                title: "Error al guardar datos",
                text: "Hubo un error al guardar los datos. Por favor, intenta de nuevo.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    return (
        <div className="p-4">
            <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Asignar Rubros de Evaluación</h1>
            
            <div style={{ flex: 'none', minWidth: '150px', alignSelf: 'right', textAlign: 'right', marginBottom: '16px' }}>
                <Button
                label="Agregar Nuevo Rubro"
                icon="pi pi-plus"
                className="mt-2"
                style={{ alignItems: 'center' }}
                onClick={() => setShowDialog(true)}
                />
            </div>

            {/* Fila de selección */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }} >
                {/* Selección de períodos */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label htmlFor="periodos" className="block font-bold mb-2" style={{fontWeight: "bold", fontSize: "25px"}}>Períodos</label>
                    <MultiSelect
                        value={periodos}
                        options={periodosDisponibles}
                        onChange={(e) => setPeriodos(e.value)}
                        placeholder="Seleccione Períodos"
                        className="w-full"
                        style={{ width: "100%", fontSize: '20px', fontWeight: 'bold' }}
                    />
                </div>

                {/* Selección de materias */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label htmlFor="materias" className="block font-bold mb-2" style={{fontWeight: "bold", fontSize: "25px"}}>Materias</label>
                    <MultiSelect
                        value={materias}
                        options={materiasDisponibles}
                        onChange={(e) => setMaterias(e.value)}
                        placeholder="Seleccione Materias"
                        className="w-full"
                        style={{ width: "100%", fontSize: '20px', fontWeight: 'bold' }}
                    />
                </div>

                {/* Selección de grados */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label htmlFor="grados" className="block font-bold mb-2" style={{fontWeight: "bold", fontSize: "25px"}}>Grados</label>
                    <MultiSelect
                        value={grados}
                        options={gradosDisponibles}
                        onChange={(e) => setGrados(e.value)}
                        placeholder="Seleccione Grados"
                        className="w-full"
                        style={{ width: "100%", fontSize: '20px', fontWeight: 'bold' }}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label htmlFor="rubros" className="block font-bold mb-2" style={{fontWeight: "bold", fontSize: "25px"}}>Rubros de Evaluación</label>
                    <MultiSelect
                        value={rubros}
                        options={rubrosDisponibles}
                        onChange={(e) => setRubros(e.value)}
                        placeholder="Seleccione Rubros"
                        className="w-full"
                        style={{ width: "100%", fontSize: '20px', fontWeight: 'bold' }}
                    />
                </div>
            </div>
            <Dialog
                header="Agregar Nuevo Rubro"
                visible={showDialog}
                style={{ width: "600px", height: "400px" }}
                onHide={() => setShowDialog(false)}
            >
                <div className="mb-3">
                    <label htmlFor="nombreRubro" className="block font-bold mb-2" style={{fontWeight: "bold", fontSize: "25px"}}>Nombre del Rubro</label>
                    <InputText
                        value={nuevoRubro.nombre}
                        onChange={(e) => setNuevoRubro({ ...nuevoRubro, nombre: e.target.value })}
                        placeholder="Nombre del Rubro"
                        className="w-full"
                        style={{ width: "100%", fontSize: '20px', fontWeight: 'bold' }}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="porcentajeRubro" className="block font-bold mb-2" style={{fontWeight: "bold", fontSize: "25px"}}>Porcentaje</label>
                    <InputNumber
                        value={nuevoRubro.porcentaje}
                        onChange={(e) => setNuevoRubro({ ...nuevoRubro, porcentaje: e.value })}
                        placeholder="Porcentaje"
                        className="w-full"
                        style={{ width: "100%", fontSize: '20px', fontWeight: 'bold' }}
                        min={0}
                        max={100}
                    />
                </div>
                <Button label="Agregar" icon="pi pi-check" style={{fontSize: "20px"}} onClick={agregarRubro} />
            </Dialog>
            
            <Button label="Insertar" icon="pi pi-plus" severity="info" onClick={insertarDatos} />

            <h2 style={{fontSize: "25px", fontWeight: "bold"}}>Datos Insertados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.values(grupos).map((g, i) => (
                    <Card key={i} title={`${g.materia} - ${g.grado}`} style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
                        <ul>
                            <li><strong >Periodo:</strong> {g.periodo}</li>
                            <li><strong>Rubros:</strong></li>
                            <ul>
                                {g.rubros.map((r, j) => (
                                    <li key={j}>{r.Rub_Nombre} ({r.Rub_Porcentaje}%)</li>
                                ))}
                            </ul>
                        </ul>
                    </Card>
                ))}
            </div>
            <Button 
                label="Guardar Configuración" 
                style={{ marginTop: '20px', fontSize: '20px' }}
                icon="pi pi-save" 
                className="p-button-success mt-4" 
                onClick={guardarDatos} 
            />
        </div>
    );
};

export default RubrosEvaluacionStep;