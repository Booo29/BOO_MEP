import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import "./StyleSteps.css";
import Swal from "sweetalert2";

import useCicloStore from "../../../store/CicloStore";
import useStore from "../../../store/store";

import { getMaterias } from '../../../Servicios/MateriaService';
import { getGradoSecciones } from '../../../Servicios/GradoSeccionService';
import { postGradoSeccionMateria } from '../../../Servicios/GradoSeccionMateriaService';


const GradoSeccionMateriaStep = () => {

    const cicloId = useCicloStore((state) => state.cicloId);
    const institutionId = useStore((state) => state.institutionId);

    const [materias, setMaterias] = useState([]);

    const [gradosYSecciones, setGradosYSecciones] = useState([]);

    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

    const toast = React.useRef(null);

    const ObtenerMaterias = async () => {
        try {
            const response = await getMaterias();
           
            setMaterias(response.map((materia) => ({
                label: materia.Mat_Nombre,
                value: materia.Mat_Id,
            })));
        } catch (error) {
            console.error("Error al obtener materias:", error);
        }
    };

    const getGradoSeccion = async () => {
        try {
            const response = await getGradoSecciones(cicloId, institutionId);
            const data = response.reduce((acc, item) => {
                const existingGrado = acc.find(
                    (grado) => grado.grado === item.Gra_Nombre
                );
                if (existingGrado) {
                    existingGrado.secciones.push({
                        id: item.Id_Grado_Seccion,
                        nombre: item.Gra_Sec_Nombre,
                        materias: [],
                    });
                } else {
                    acc.push({
                        grado: item.Gra_Nombre,
                        secciones: [
                            {
                                id: item.Id_Grado_Seccion,
                                nombre: item.Gra_Sec_Nombre,
                                materias: [],
                            },
                        ],
                    });
                }
                return acc;
            }, []);
            setGradosYSecciones(data);
        } catch (error) {
            console.error("Error al obtener grados y secciones:", error);
        }
    };

    const GuardarGradoSeccionMateria = async (asignaciones) => {
        try {
            await postGradoSeccionMateria(asignaciones);
            Swal.fire({
                icon: "success",
                title: "Secciones y materias guardadas",
                text: "Las secciones se han guardado correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });

        } catch (error) {
            console.error("Error al guardar asignaciones:", error);
            Swal.fire({
                icon: "error",
                title: "Error al guardar las secciones",
                text: "Hubo un error al guardar las secciones. Por favor, intenta de nuevo.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    useEffect(() => {
        ObtenerMaterias();
        getGradoSeccion();
    }, [cicloId, institutionId]);


    const handleAsignarTodas = () => {
        const updatedGradosYSecciones = gradosYSecciones.map((grado) => ({
            ...grado,
            secciones: grado.secciones.map((seccion) => ({
                ...seccion,
                materias: materiasSeleccionadas,
            })),
        }));

        setGradosYSecciones(updatedGradosYSecciones);
    };

    const handleAsignarMateria = (gradoIndex, seccionIndex, materiasSeleccionadas) => {
        const updatedGradosYSecciones = [...gradosYSecciones];
        updatedGradosYSecciones[gradoIndex].secciones[seccionIndex].materias =
            materiasSeleccionadas;
        setGradosYSecciones(updatedGradosYSecciones);
    };

    const handleGuardarAsignaciones = () => {
        const asignaciones = gradosYSecciones.flatMap((grado) =>
            grado.secciones.flatMap((seccion) =>
                seccion.materias.map((materiaId) => ({
                    Grado_Seccion_Id_Grado_Seccion: seccion.id,
                    Materias_Mat_Id: materiaId,
                    Instituciones_Inst_Id: institutionId,
                }))
            )
        );

        GuardarGradoSeccionMateria(asignaciones);
    };

    return (
        <div className="asignar-materias-container">
            <Toast ref={toast} />

            <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Asignar Materias a Grados y Secciones</h1>
            <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
            {/* Asignar a todos los grados y secciones */}
            <div className="asignar-todas-container">
                <h3>Con esta opción podrás asignar las materias a todos los Grados y Secciones</h3>
                <MultiSelect
                    value={materiasSeleccionadas}
                    options={materias}
                    onChange={(e) => setMateriasSeleccionadas(e.value)}
                    placeholder="Seleccione materias"
                    display="chip"
                />
                <Button
                    label="Asignar a Todos"
                    icon="pi pi-check"
                    severity="info"
                    style={{ marginLeft: "10px" }}
                    onClick={handleAsignarTodas}
                />
            </div>
            <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
            {/* Grados como cards */}
            <div className="grados-container">
                {gradosYSecciones.map((grado, gradoIndex) => (
                    <Card
                        key={gradoIndex}
                        title={grado.grado}
                        className="grado-card"
                    >
                        <div className="secciones-container">
                            {grado.secciones.map((seccion, seccionIndex) => (
                                <div key={seccion.id} className="seccion-item">
                                    <h3>{seccion.nombre}</h3>
                                    <MultiSelect
                                        value={seccion.materias}
                                        style={{ width: "100%" }}
                                        options={materias}
                                        onChange={(e) =>
                                            handleAsignarMateria(
                                                gradoIndex,
                                                seccionIndex,
                                                e.value
                                            )
                                        }
                                        placeholder="Seleccione materias"
                                        display="chip"
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <Button
                label="Guardar Asignaciones"
                icon="pi pi-save"
                className="p-button-success mt-3"
                onClick={handleGuardarAsignaciones}
            />
        </div>
    );
};

export default GradoSeccionMateriaStep;
