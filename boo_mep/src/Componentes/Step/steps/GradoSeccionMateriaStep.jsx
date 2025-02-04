import React, { useState, useEffect } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import "./StyleSteps.css";
import Swal from "sweetalert2";

import useCicloStore from "../../../store/CicloStore";
import useStore from "../../../store/store";

import { getMaterias, postMateria } from '../../../Servicios/MateriaService';
import { getGradoSecciones } from '../../../Servicios/GradoSeccionService';
import { postGradoSeccionMateria } from '../../../Servicios/GradoSeccionMateriaService';


const GradoSeccionMateriaStep = () => {

    const cicloId = useCicloStore((state) => state.cicloId);
    const institutionId = useStore((state) => state.institutionId);

    const [materias, setMaterias] = useState([]);

    const [gradosYSecciones, setGradosYSecciones] = useState([]);

    const [materiasSeleccionadas, setMateriasSeleccionadas] = useState([]);

    const [materiaNueva, setMateriaNueva] = useState("");

    const [openDialog, setOpenDialog] = useState(false);

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

    const handleGuardarMateria = async () => {
        try {
            const response = await postMateria(materiaNueva);
            setMaterias([...materias, { label: response.Mat_Nombre, value: response.Mat_Id }]);
            setMateriaNueva("");
            setOpenDialog(false);
            toast.current.show({
                severity: "success",
                summary: "Materia creada",
                detail: "La materia se ha creado correctamente.",
                life: 3000,
            });
        } catch (error) {
            console.error("Error al crear materia:", error);
            toast.current.show({
                severity: "error",
                summary: "Error al crear materia",
                detail: "Hubo un error al crear la materia. Por favor, intenta de nuevo.",
                life: 3000,
            });
        }
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
                    filter
                />
                <Button
                    label="Asignar a Todos"
                    icon="pi pi-check"
                    severity="info"
                    style={{ marginLeft: "10px" }}
                    onClick={handleAsignarTodas}
                />
                <Button
                    label="Crear Nueva Materia"
                    icon="pi pi-plus"
                    style={{ marginLeft: "10px", backgroundColor: "#33b29f", borderColor: "#33b29f" }}
                    onClick={() => setOpenDialog(true)}
                    
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

            {/* Dialog para crear materia */}
            <Dialog
                header="Crear Nueva Materia"
                visible={openDialog}
                style={{ width: "30vw" }}
                onHide={() => setOpenDialog(false)}
            >
                <div className="p-field">
                    <label htmlFor="materia">Nombre de la Materia</label>
                    <InputText
                        id="materia"
                        value={materiaNueva}
                        onChange={(e) => setMateriaNueva(e.target.value)}
                    />
                </div>
                <Button
                    label="Guardar Materia"
                    icon="pi pi-save"
                    className="p-button-success mt-3"
                    onClick={handleGuardarMateria}
                />
            </Dialog>

        </div>
    );
};

export default GradoSeccionMateriaStep;
