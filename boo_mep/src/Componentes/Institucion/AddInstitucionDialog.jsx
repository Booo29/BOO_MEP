import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { ListBox } from "primereact/listbox";
import PropTypes from "prop-types";
import "./Institucion.css";
import { getMateriasInstitucion, deleteMateriaInstitucion } from "../../Servicios/MateriaInstitucionService";


const AddInstitucionDialog = ({ visible, onHide, onSave, institucion, materiasDisponibles }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "",
        direccionRegional: "",
        circuito: "",
        materiasSeleccionadas: [],
    });

    const [materiasAsociadas, setMateriasAsociadas] = useState([]);

    useEffect(() => {
        if (institucion) {
            console.log("Institucion dialog", institucion);
            setFormData({
                idInstitucion: institucion.Inst_Id,
                nombre: institucion.Inst_Nombre || "",
                tipo: institucion.Inst_Tipo || "",
                direccionRegional: institucion.Inst_DireccionRegional || "",
                circuito: institucion.Inst_Circuito || "",
                materiasSeleccionadas: institucion.Materis?.map((mat) => mat.Mat_Id) || [],
            });

            const cargarMateriasInstitucion = async () => {
                try {
                    if (institucion) {
                        const materias = await getMateriasInstitucion(institucion.Inst_Id);
                        setMateriasAsociadas(
                            materias.map((materia) => ({
                                id: materia.Mat_Ins_Id,
                                nombre: materia.Mat_Nombre,
                            }))
                        );
                    }
                } catch (error) {
                    console.error("Error al cargar materias de la institución", error);
                }
            };

            cargarMateriasInstitucion();

        } else {
            setFormData({ nombre: "", tipo: "", direccionRegional: "", circuito: "", materiasSeleccionadas: [] });
        }
    }, [institucion]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        if (!formData.nombre || !formData.tipo) {
            alert("Por favor complete todos los campos obligatorios");
            return;
        }
        const payload = {
            ...formData,
            materiasSeleccionadas: formData.materiasSeleccionadas.map((id) => ({ Mat_Id: id })),
        };
        onSave(payload);
    };

    const eliminarMateria = async (materiaId) => {
        try {
            console.log("Materia a eliminar", materiaId);
            await deleteMateriaInstitucion(materiaId, institucion.Inst_Id);
            setMateriasAsociadas(materiasAsociadas.filter((m) => m.id !== materiaId));
        } catch (error) {
            console.error("Error al eliminar la materia de la institución", error);
        }
    };

    return (
        <Dialog
            header={institucion ? "Editar Institución" : "Agregar Institución"}
            visible={visible}
            onHide={onHide}
            style={{ width: "50vw" }}
            modal
            footer={
                <Button
                    label="Guardar"
                    icon="pi pi-check"
                    className="button-dialog"
                    onClick={handleSave}
                />
            }
        >
            <div className="p-field">
                <label htmlFor="nombre" className="label-dialog">Nombre</label>
                <InputText id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
            </div>
            <div className="p-field">
                <label htmlFor="tipo" className="label-dialog">Tipo</label>
                <InputText id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} />
            </div>
            <div className="p-field">
                <label htmlFor="direccionRegional" className="label-dialog">Dirección Regional</label>
                <InputText id="direccionRegional" name="direccionRegional" value={formData.direccionRegional} onChange={handleChange} />
            </div>
            <div className="p-field">
                <label htmlFor="circuito" className="label-dialog">Circuito</label>
                <InputText id="circuito" name="circuito" value={formData.circuito} onChange={handleChange} />
            </div>
            <div className="p-field">
                <label htmlFor="materias" style={{ marginRight: "0.5rem" }}>Materias</label>
                <MultiSelect
                    id="materias"
                    value={formData.materiasSeleccionadas}
                    options={materiasDisponibles}
                    onChange={(e) => setFormData({ ...formData, materiasSeleccionadas: e.value })}
                    placeholder="Seleccione materias"
                    className="w-full"
                />
            </div>
            <div className="p-field">
                <h4>Materias Asociadas</h4>
                <ListBox
                    value={materiasAsociadas}
                    options={materiasAsociadas}
                    optionLabel="nombre"
                    className="w-full"
                    itemTemplate={(materia) => (
                        <div className="flex justify-content-between align-items-center">
                            <span>{materia.nombre}</span>
                            <Button
                                icon="pi pi-trash"
                                className="p-button-text p-button-danger"
                                style={{ padding: 0 }}
                                onClick={() => eliminarMateria(materia.id)}
                            />
                        </div>
                    )}
                />
            </div>
        </Dialog>
    );
};

AddInstitucionDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    institucion: PropTypes.object,
    materiasDisponibles: PropTypes.array.isRequired,
};

export default AddInstitucionDialog;
