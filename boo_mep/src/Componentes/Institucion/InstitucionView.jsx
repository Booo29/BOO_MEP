import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import InstitucionCard from "./InstitucionCard";
import AddInstitucionDialog from "./AddInstitucionDialog";
import { deleteInstitucion, putInstitucion, postInstitucion, getInstituciones } from "../../Servicios/InstitucionService";
import "./Institucion.css";
import Cookies from 'universal-cookie';
import { jwtDecode } from "jwt-decode";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const InstitucionesView = () => {

    const cookies = new Cookies();  

    const navigate = useNavigate();

    const [instituciones, setInstituciones] = useState([]);
    // const [materiasDisponibles, setMateriasDisponibles] = useState([]);
    const [isDialogVisible, setDialogVisible] = useState(false);
    const [selectedInstitucion, setSelectedInstitucion] = useState(null);

    // const [dialogVisibleCiclo, setDialogVisibleCiclo] = useState(false);
    // const [isCiclosDialogVisible, setCiclosDialogVisible] = useState(false);
    // const [selectedCiclosInstitucion, setSelectedCiclosInstitucion] = useState(null);


    const idProfesor = jwtDecode(cookies.get("token")).id;

    const fetchInstituciones = async () => {
        try {
            const data = await getInstituciones(idProfesor);
            //const data = await getInstituciones(idProfesor);
            //const materias = await getMaterias();
            //console.log("data view", insti);
            setInstituciones(data);
            //setMateriasDisponibles(materias.map((mat) => ({ label: mat.Mat_Nombre, value: mat.Mat_Id })));
           
        } catch (error) {
            console.error("Error al obtener instituciones:", error);
        }
    };

    useEffect(() => {
        fetchInstituciones();
    }, []);

    const handleAddEdit = async (datos) => {

        try {
            if (datos.idInstitucion) {
                console.log("Datos a actualizar", datos);
                await putInstitucion(datos);
                Swal.fire({
                    title: "Guardado",
                    text: "La institución ha sido actualizada",
                    icon: "success",
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                })
            } else {
                datos.idProfesor = idProfesor;
                console.log("Datos a guardar", datos);
                await postInstitucion(datos);
                Swal.fire({
                    title: "Guardado",
                    text: "La institución ha sido Guardada",
                    icon: "success",
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 1500,
                })
            }
          fetchInstituciones();
            setDialogVisible(false);
        } catch (error) {
            console.error("Error al guardar institución:", error);
        }
    };

    // const handleAdd = () => {
    //     navigate('/StepsFormPage');
    // }

    const handleDelete = async (id) => {
        Swal.fire({
            title: "¿Está seguro?",
            text: "Esta acción no se puede deshacer",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await deleteInstitucion(id);
                    Swal.fire({
                        title: "Eliminado",
                        text: "La institución ha sido eliminada",
                        icon: "success",
                        position: "top-end",
                        showConfirmButton: false,
                        timer: 1500,
                    })
                    fetchInstituciones();
                } catch (error) {
                    console.error("Error al eliminar institución:", error);
                }
            }
        });
    };

    // const handleManageCiclos = (institucion) => {
    //     setSelectedCiclosInstitucion(institucion);
    //     setCiclosDialogVisible(true);
    // };

    return (
        <div className="instituciones-container">
            <h1 className="main-title">Ingreso de Instituciones y Ciclos</h1>
            <p className="description">
                Aquí puede gestionar las instituciones donde trabaja. Puede agregar, editar o eliminar instituciones y gestionar los ciclos relacionados.
            </p>
            <Button
                label="Agregar Institución"
                icon="pi pi-plus"
                className="p-button-success button-institucion"
                // onClick={handleAdd}
                onClick={() => {
                    setSelectedInstitucion(null);
                    setDialogVisible(true);
                }}
            />
            <div className="instituciones-list" >
                {instituciones.map((institucion) => (
                    <InstitucionCard
                        key={institucion.Inst_Id}
                        institucion={institucion}
                        onEdit={() => {
                            setSelectedInstitucion(institucion);
                            setDialogVisible(true);
                        }}
                        onDelete={() => handleDelete(institucion.Inst_Id)}
                        // onManageCiclos={() => handleManageCiclos(institucion)}
                    />
                ))}
            </div>
            <AddInstitucionDialog
                visible={isDialogVisible}
                onHide={() => setDialogVisible(false)}
                onSave={handleAddEdit}
                institucion={selectedInstitucion}
            />
            {/* <CiclosManager
                idInstitucion={selectedCiclosInstitucion?.Inst_Id}
                visible={isCiclosDialogVisible}
                onClose={() => setCiclosDialogVisible(false)}
            /> */}
        </div>
    );
};

export default InstitucionesView;