import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import PropTypes from "prop-types";
import "./Institucion.css";


const AddInstitucionDialog = ({ visible, onHide, onSave, institucion }) => {
    const [formData, setFormData] = useState({
        nombre: "",
        tipo: "",
        direccionRegional: "",
        circuito: "",
    });


    useEffect(() => {
        if (institucion) {
            setFormData({
                idInstitucion: institucion.Inst_Id,
                nombre: institucion.Inst_Nombre || "",
                tipo: institucion.Inst_Tipo || "",
                direccionRegional: institucion.Inst_DireccionRegional || "",
                circuito: institucion.Inst_Circuito || "",
            });

        } else {
            setFormData({ nombre: "", tipo: "", direccionRegional: "", circuito: "" });
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
            ...formData
        };
        onSave(payload);
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
           
        </Dialog>
    );
};

AddInstitucionDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    institucion: PropTypes.object,
};

export default AddInstitucionDialog;
