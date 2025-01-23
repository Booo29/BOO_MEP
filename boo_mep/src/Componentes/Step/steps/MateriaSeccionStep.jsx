import React, { useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Tree } from "primereact/tree";
import { Toast } from "primereact/toast";
import "./StyleSteps.css";

const MateriaSeccionStep = () => {
    const [materias, setMaterias] = useState([
        { id: 1, nombre: "Matemáticas" },
        { id: 2, nombre: "Ciencias" },
        { id: 3, nombre: "Historia" },
    ]);

    const [gradosYSecciones, setGradosYSecciones] = useState([
        {
            key: "1",
            label: "Primero (Primaria)",
            children: [
                { key: "1-1", label: "Sección 1" },
                { key: "1-2", label: "Sección 2" },
            ],
        },
        {
            key: "2",
            label: "Segundo (Primaria)",
            children: [
                { key: "2-1", label: "Sección 1" },
                { key: "2-2", label: "Sección 2" },
            ],
        },
    ]);

    const [materiaSeleccionada, setMateriaSeleccionada] = useState(null);
    const [asignaciones, setAsignaciones] = useState([]);
    const toast = React.useRef(null);

    const handleGuardarAsignacion = () => {
        if (!materiaSeleccionada) {
            toast.current.show({
                severity: "warn",
                summary: "Advertencia",
                detail: "Seleccione una materia para asignar",
            });
            return;
        }

        const seleccionados = gradosYSecciones
            .flatMap((grado) => grado.children || [])
            .filter((seccion) => seccion.selected);

        if (seleccionados.length === 0) {
            toast.current.show({
                severity: "warn",
                summary: "Advertencia",
                detail: "Seleccione al menos un grado o sección",
            });
            return;
        }

        const nuevasAsignaciones = seleccionados.map((seccion) => ({
            materia: materiaSeleccionada,
            gradoOSeccion: seccion.label,
        }));

        setAsignaciones([...asignaciones, ...nuevasAsignaciones]);

        toast.current.show({
            severity: "success",
            summary: "Asignación realizada",
            detail: `Se asignaron materias correctamente`,
        });

        // Limpiar selección
        setMateriaSeleccionada(null);
        const resetGrados = gradosYSecciones.map((grado) => ({
            ...grado,
            children: grado.children.map((seccion) => ({
                ...seccion,
                selected: false,
            })),
        }));
        setGradosYSecciones(resetGrados);
    };

    return (
        <div className="asignar-materias-container">
            <Toast ref={toast} />

            <h2>Asignar Materias</h2>

            {/* Selección de Materia */}
            <div className="p-field">
                <label htmlFor="materia">Seleccione una Materia:</label>
                <Dropdown
                    id="materia"
                    value={materiaSeleccionada}
                    onChange={(e) => setMateriaSeleccionada(e.value)}
                    options={materias.map((materia) => ({
                        label: materia.nombre,
                        value: materia,
                    }))}
                    placeholder="Seleccione una materia"
                />
            </div>

            {/* Selección de Grados y Secciones */}
            <div className="p-field">
                <label>Seleccione los Grados y Secciones:</label>
                <Tree
                    value={gradosYSecciones}
                    selectionMode="checkbox"
                    onSelectionChange={(e) => setGradosYSecciones(e.value)}
                    metaKeySelection={false} // Permite selección múltiple sin usar la tecla Ctrl
                />
            </div>

            {/* Botón de Guardar */}
            <div className="p-field">
                <Button
                    label="Guardar Asignación"
                    icon="pi pi-save"
                    className="p-button-success"
                    onClick={handleGuardarAsignacion}
                />
            </div>

            {/* Resumen de Asignaciones */}
            <h3>Resumen de Asignaciones</h3>
            <ul>
                {asignaciones.map((asignacion, index) => (
                    <li key={index}>
                        {asignacion.materia.nombre} asignada a{" "}
                        {asignacion.gradoOSeccion}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MateriaSeccionStep;
