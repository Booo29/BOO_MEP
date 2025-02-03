import React, { useState, useEffect } from "react";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { getGrados, postGrado } from "../../../Servicios/GradoService";
import { postGradoSeccion } from "../../../Servicios/GradoSeccionService";
import useCicloStore from "../../../store/CicloStore";
import "./StyleSteps.css";
import Swal from "sweetalert2";

const GradoSeccionesStep = () => {
    const idCiclo = useCicloStore((state) => state.cicloId);

    const [gradosDisponibles, setGradosDisponibles] = useState([]);
    const [gradosSeleccionados, setGradosSeleccionados] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [nuevoGrado, setNuevoGrado] = useState({ Gra_Nombre: "", Gra_Tipo: "Primaria" });

    const tipos = ["Primaria", "Secundaria", "Otros"];

    // Cargar los grados desde la base de datos
    useEffect(() => {
        const cargarGrados = async () => {
            try {
                const response = await getGrados();
                console.log("Grados cargados:", response.data);
                setGradosDisponibles(response);
            } catch (error) {
                console.error("Error al cargar los grados:", error);
            }
        };

        cargarGrados();
    }, []);

    const manejarCheckbox = (grado) => {
        const existe = gradosSeleccionados.find((g) => g.Gra_Id === grado.Gra_Id);
        if (existe) {
            setGradosSeleccionados((prev) => prev.filter((g) => g.Gra_Id !== grado.Gra_Id));
        } else {
            setGradosSeleccionados([...gradosSeleccionados, { ...grado, secciones: [] }]);
        }
    };

    const actualizarCantidadSecciones = (id, cantidad) => {
        setGradosSeleccionados((prev) =>
            prev.map((grado) =>
                grado.Gra_Id === id
                    ? {
                          ...grado,
                          secciones: Array.from({ length: cantidad }, (_, index) => grado.secciones[index] || ""),
                      }
                    : grado
            )
        );
    };

    const actualizarNombreSeccion = (gradoId, index, nombre) => {
        setGradosSeleccionados((prev) =>
            prev.map((grado) =>
                grado.Gra_Id === gradoId
                    ? {
                          ...grado,
                          secciones: grado.secciones.map((seccion, i) =>
                              i === index ? nombre : seccion
                          ),
                      }
                    : grado
            )
        );
    };

    const guardarSecciones = async () => {
        const seccionesAGuardar = [];
        gradosSeleccionados.forEach((grado) => {
            grado.secciones.forEach((nombreSeccion) => {
                seccionesAGuardar.push({
                    Gra_Sec_Nombre: nombreSeccion || `Sección ${grado.Gra_Nombre}-${grado.secciones.length + 1}`,
                    Grados_idGrados: grado.Gra_Id,
                    Ciclo_Cic_Id: idCiclo,
                });
            });
        });

        try {
            console.log("Secciones a guardar:", seccionesAGuardar);
            await postGradoSeccion(seccionesAGuardar);
            Swal.fire({
                icon: "success",
                title: "Secciones guardadas",
                text: "Las secciones se han guardado correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error al guardar las secciones:", error);
            Swal.fire({
                icon: "error",
                title: "Error al guardar las secciones",
                text: "Hubo un error al guardar las secciones. Por favor, intenta de nuevo.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    };

    const gradosPorTipo = (tipo) => {
        return gradosDisponibles.filter((grado) => grado.Gra_Tipo === tipo);
    }

    const abrirDialogo = () => {
        setNuevoGrado({ Gra_Nombre: "", Gra_Tipo: "" }); // Reiniciar el formulario
        setShowDialog(true);
    };

    const guardarGrado = async () => {
        try {
            console.log("Guardando grado:", nuevoGrado);
            const response = await postGrado(nuevoGrado);
            console.log("Grado guardado:", response.grado);
            setGradosDisponibles([...gradosDisponibles, response.grado]);
            Swal.fire({
                icon: "success",
                title: "Grado guardado",
                text: "El grado se ha guardado correctamente.",
                timer: 2000,
                showConfirmButton: false,
            });

            setShowDialog(false);
        } catch (error) {
            console.error("Error al guardar el grado:", error);
            Swal.fire({
                icon: "error",
                title: "Error al guardar el grado",
                text: "Hubo un error al guardar el grado. Por favor, intenta de nuevo.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
    }

    return (
        <div className="p-4">
            <h2>Gestión de Grados y Secciones</h2>
            <Button label="Crear Nuevo Grado" icon="pi pi-plus" severity="info" onClick={abrirDialogo} style={{marginBottom: "2rem"}}/>

            {/* Parte Superior: Checkboxes */}
            <div className="grados-container">
            {["Primaria", "Secundaria", "Otros"].map((tipo, index) => (
                    <div key={tipo} className={`grados-columna ${index > 0 ? "columna-separada" : ""}`}>
                        <h4>{tipo}</h4>
                        {gradosPorTipo(tipo).map((grado) => (
                            <div key={grado.Gra_Id} className="p-field-checkbox">
                                <label>
                                    <input
                                        type="checkbox"
                                        className="checkbox-grado"
                                        checked={gradosSeleccionados.some((g) => g.Gra_Id === grado.Gra_Id)}
                                        onChange={() => manejarCheckbox(grado)}
                                    />
                                    {grado.Gra_Nombre}
                                </label>
                            </div>
            ))}
                    </div>
                ))}
            </div>

            {/* Parte Inferior: Grados Seleccionados */}
            <div className="secciones-container">
                {gradosSeleccionados.map((grado) => (
                    <div className="grado-seccion" key={grado.Gra_Id}>
                        <div className="p-card p-shadow-3 p-mb-3 " style={{ padding: "10px" }}>
                            <h4 style={{fontSize: "20px", fontWeight: "bold",}}>{grado.Gra_Nombre}</h4>
                            <p style={{fontSize: "20px", fontWeight: "bold",}}>
                                Tipo: <strong style={{fontSize: "20px", fontWeight: "bold",}}>{grado.Gra_Tipo}</strong>
                            </p>
                            <div>
                                <label style={{fontSize: "20px", fontWeight: "bold", marginRight: "10px"}}>Cantidad de Secciones:</label>
                                <InputNumber
                                    value={grado.secciones.length}
                                    onValueChange={(e) =>
                                        actualizarCantidadSecciones(grado.Gra_Id, e.value || 0)
                                    }
                                    min={0}
                                    max={20} // Límite ajustable
                                />
                            </div>
                            <div className="p-grid mt-3">
                                {grado.secciones.map((seccion, index) => (
                                    <div className="p-col-12 p-md-4" key={index}>
                                        <InputText
                                            placeholder={`Sección ${index + 1}`}
                                            value={seccion}
                                            onChange={(e) =>
                                                actualizarNombreSeccion(
                                                    grado.Gra_Id,
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Botón para Guardar Secciones */}
            <Button
                label="Guardar Secciones"
                icon="pi pi-save"
                className="p-button-success mt-4"
                onClick={guardarSecciones}
            />

            {/* Diálogo para Crear Nuevo Grado */}
            <Dialog
                header="Crear Nuevo Grado"
                visible={showDialog}
                style={{ width: "800px" }}
                onHide={() => setShowDialog(false)}
                footer={
                    <div>
                        <Button
                            label="Cancelar"
                            icon="pi pi-times"
                            onClick={() => setShowDialog(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Guardar"
                            icon="pi pi-check"
                            onClick={guardarGrado}
                        />
                    </div>
                }
            >
                <div>
                    <div className="p-field">
                        <label htmlFor="nombre" style={{fontSize: "20px", fontWeight: "bold",}}>Nombre del Grado</label>
                        <InputText
                            id="nombre"
                            style={{ width: "100%", marginTop: "0.5rem", fontSize: "20px", fontWeight: "bold"}}
                            value={nuevoGrado.Gra_Nombre}
                            onChange={(e) =>
                                setNuevoGrado({ ...nuevoGrado, Gra_Nombre: e.target.value })
                            }
                        />
                    </div>
                    <div className="p-field">
                        <label htmlFor="tipo" style={{fontSize: "20px", fontWeight: "bold",}}>Tipo</label>
                        <Dropdown
                            id="tipo"
                            value={nuevoGrado.Gra_Tipo}
                            style={{ width: "100%", marginTop: "0.5rem" }}
                            options={tipos}
                            onChange={(e) =>
                                setNuevoGrado({ ...nuevoGrado, Gra_Tipo: e.value })
                            }
                            placeholder="Seleccione un tipo"
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default GradoSeccionesStep;
