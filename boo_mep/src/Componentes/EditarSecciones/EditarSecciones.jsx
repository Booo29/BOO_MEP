import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import {getEdicionSecciones, postEdicionSeccion, putEdicionSeccion, deleteEdicionSeccion } from "../../Servicios/EdicionSeccionService";
import {getMaterias} from "../../Servicios/MateriaService";
import {getGrados} from "../../Servicios/GradoService";
import { useNavigate } from 'react-router-dom';
import useCicloStore from "../../store/CicloStore";
import useStore from "../../store/store";
import Swal from "sweetalert2";

const EditarSecciones = () => {
    const [secciones, setSecciones] = useState([]);
    const [materias, setMaterias] = useState([]);
    const [grados, setGrados] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedGrado, setSelectedGrado] = useState(null);
    const [nombreSeccion, setNombreSeccion] = useState("");
    const [selectedMaterias, setSelectedMaterias] = useState([]);
    const [editingSeccion, setEditingSeccion] = useState(null);

    const cicloId = useCicloStore((state) => state.cicloId);
    const institutionId = useStore((state) => state.institutionId);

    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const materiasData = await getMaterias();
        const gradosData = await getGrados();
        const seccionesData = await getEdicionSecciones(cicloId, institutionId);
        setMaterias(materiasData);
        setGrados(gradosData);
        setSecciones(seccionesData);
    };

    const handleSave = async () => {
        const payload = {
            Gra_Sec_Nombre: nombreSeccion,
            Grados_idGrados: selectedGrado?.Gra_Id,
            Ciclo_Cic_Id: cicloId,
            Instituciones_Inst_Id: institutionId,
            materias: selectedMaterias.map(m => m.Mat_Id)
        };
        
        if (editingSeccion) {
            await putEdicionSeccion(editingSeccion.Id_Grado_Seccion, payload);
            Swal.fire({
                icon: "success",
                title: "Sección guardada",
                text: "La sección ha sido editada exitosamente.",
                timer: 2000,
                showConfirmButton: false,
            });


        } else {
            await postEdicionSeccion(payload);
            Swal.fire({
                icon: "success",
                title: "Sección guardada",
                text: "La sección ha sido guardad exitosamente.",
                timer: 2000,
                showConfirmButton: false,
            });
        }
        setModalVisible(false);
        resetForm();
        loadData();
    };

    const handleEdit = (seccion) => {
        setEditingSeccion(seccion);
        setSelectedGrado(grados.find(g => g.Gra_Nombre === seccion.Gra_Nombre));
        setNombreSeccion(seccion.Gra_Sec_Nombre);
        setSelectedMaterias(materias.filter(m => seccion.materias.includes(m.Mat_Nombre)));
        setModalVisible(true);
    };

    const handleDelete = async (seccionId) => {

        Swal.fire({
            title: "¿Estás seguro?",
            text: "Una vez eliminada, no podrás recuperar esta sección.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            await deleteEdicionSeccion(seccionId, institutionId);
            loadData();
            Swal.fire({
                icon: "success",
                title: "Sección eliminada",
                text: "La sección ha sido eliminada exitosamente.",
                timer: 2000,
                showConfirmButton: false,
            });
        });


        
    };

    const resetForm = () => {
        setSelectedGrado(null);
        setNombreSeccion("");
        setSelectedMaterias([]);
        setEditingSeccion(null);
    };

    const handleMenu = () => {
        navigate('/MenuPage');
      };

    return (
        <div style={{ padding: "16px" }} >
            <Button label="Regresar" severity="help" onClick={handleMenu} />

            <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold'}}>Gestión de Secciones</h1>

            <div style={{ marginBottom: "16px" }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>
                    Aquí puedes administrar las secciones de los diferentes grados.
                </p>
            </div>

    
            <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

            <Button label="Crear Nueva Sección" icon="pi pi-plus" onClick={() => setModalVisible(true)} />
            <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
            <DataTable value={secciones} className="mt-4" stripedRows emptyMessage="No hay secciones para mostrar">
                <Column field="Gra_Nombre" header="Grado" sortable />
                <Column field="Gra_Sec_Nombre" header="Sección" sortable/>
                <Column field="materias" header="Materias"/>
                <Column body={row => (
                    <div className="flex justify-content-center" style={{ gap: "8px", width: "100%", justifyContent: "center", alignItems: "center", display: "flex" }}>
                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-success mr-2" onClick={() => handleEdit(row)} />
                        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger" onClick={() => handleDelete(row.Id_Grado_Seccion)} />
                    </div>
                )} />
            </DataTable>
            <Dialog 
                visible={modalVisible} 
                onHide={() => setModalVisible(false)} 
                header="Crear o Editar una Sección" 
                modal
                style={{ width: "800px" }}
            >
                <div className="p-fluid">
                    <Dropdown 
                        value={selectedGrado} 
                        options={grados} 
                        onChange={(e) => setSelectedGrado(e.value)} 
                        optionLabel="Gra_Nombre" 
                        placeholder="Seleccione un grado"
                        filter 
                        style={{ width: "100%", marginBottom: "20px" }}
                    />
                </div> 

                <div className="p-fluid">  
                    <InputText 
                        value={nombreSeccion} 
                        onChange={(e) => setNombreSeccion(e.target.value)} 
                        placeholder="Nombre de la sección" 
                        style={{ width: "100%", marginBottom: "20px" }}
                        
                    />
                </div> 

                <div className="p-fluid">    
                    <MultiSelect 
                        value={selectedMaterias} 
                        options={materias} 
                        onChange={(e) => setSelectedMaterias(e.value)} 
                        optionLabel="Mat_Nombre" 
                        placeholder="Seleccione materias" 
                        display="chip"
                        filter
                        style={{ width: "100%", marginBottom: "20px" }}
                    />
                </div>  

                <div className="mt-4 flex justify-content-center" style={{ gap: "8px", width: "100%", justifyContent: "center", alignItems: "center", display: "flex" }}>
                    <Button label="Cancelar" className="p-button-warning" style={{width: "50%"}} onClick={() => { setModalVisible(false); resetForm(); }} />
                    <Button label="Guardar" className="p-button-primary" style={{width: "50%"}} onClick={handleSave}  />
                </div>
                
            </Dialog>
        </div>
    );
};

export default EditarSecciones;
