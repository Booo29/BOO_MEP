import React, { useState, useEffect } from "react";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from "primereact/calendar";
import { addLocale } from 'primereact/api';
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import { GetCronicas, PostCronica, PutCronica, DeleteCronica } from "../../Servicios/CronicasService";
import {getInstitucionbyId} from '../../Servicios/InstitucionService';
import useCicloStore from "../../store/CicloStore";
import Cookies from 'universal-cookie';
import { jwtDecode } from "jwt-decode";
import {GenerarDocumento} from '../Informes/GenerarDocumento';
import useStore from "../../store/store";

const Cronicas = () => {

    const cicloId = useCicloStore((state) => state.cicloId);
    const institutionId = useStore((state) => state.institutionId);

    const navigate = useNavigate();
    const cookies = new Cookies();  

    const [cronicas, setCronicas] = useState([]);
    const [cronica, setCronica] = useState({ descripcion: "", fecha: null });
    const [visible, setVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [institucion, setInstitucion] = useState(null);

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

    useEffect(() => {
        loadCronicas();
    }, [cicloId]);

    const loadCronicas = async () => {
        try {
            const data = await GetCronicas(cicloId);
            setCronicas(data);
            const institucion = await getInstitucionbyId(institutionId);
            setInstitucion(institucion);
        } catch (error) {
            console.error("Error loading crónicas", error);
        }
    };

    const saveCronica = async () => {
        try {
            if (isEditing) {
                await PutCronica(cronica.id, cronica.descripcion, cronica.fecha.toISOString().split("T")[0]);
                Swal.fire({
                    title: "Crónica Actualizada Correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });
            } else {
                await PostCronica(cicloId, cronica.descripcion, cronica.fecha.toISOString().split("T")[0]);
                Swal.fire({
                    title: "Crónica Registrada Correctamente",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });
            }
            loadCronicas();
            setVisible(false);
            setCronica({ descripcion: "", fecha: null });
        } catch (error) {
            console.error("Error saving crónica", error);
            Swal.fire({
                title: "Error al guardar la crónica",
                icon: "error",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    };

    const deleteCronica = async (cronicaId) => {
            try {
                Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¡No podrás revertir esto!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    cancelButtonText: 'Cancelar',
                    confirmButtonText: 'Sí, bórralo'
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        await DeleteCronica(cronicaId);
                        Swal.fire({
                            icon: "success",
                            title: "La Crónica ha sido eliminada",
                            text: "La Crónica ha sido eliminada exitosamente.",
                            timer: 2000,
                            showConfirmButton: false,
                        });
                        loadCronicas();
                    }
                });
                
            } catch (error) {
                console.error("Error deleting crónica", error);
            }
        
    };

    const openEditDialog = (rowData) => {
        setCronica({ id: rowData.id, descripcion: rowData.descripcion, fecha: new Date(rowData.fecha) });
        setIsEditing(true);
        setVisible(true);
    };

    const handlePrint = (rowData) => {
        const datosInforme = {
            fechaHoy: new Date().toISOString().split("T")[0],
            profesor: `${jwtDecode(cookies.get("token")).profesor}`,
            institucion: institucion.Inst_Nombre,
            fecha: new Date(rowData.fecha).toISOString().split("T")[0],
            descripcion: rowData.descripcion,
        };

        GenerarDocumento("CRONICA.docx", datosInforme, "CRONICA");
    };

    const handleMenu = () => {
        navigate('/MenuPage');
      };

    return (
       <div style={{ padding: "16px" }} >
             <Button label="Regresar" severity="help" onClick={handleMenu} />
             <h1 style={{textAlign: 'center', fontSize: '2rem', fontWeight: 'bold' }}>Registro de Crónicas</h1>
             <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>
            <Button label="Agregar Crónica" icon="pi pi-plus" onClick={() => { setVisible(true); setIsEditing(false); }} />
            <div style={{ borderTop: "1px solid #ccc", margin: "20px 0" }}></div>

            <DataTable value={cronicas} paginator rows={5} emptyMessage="No hay crónicas registradas" stripedRows  >

                <Column field="fecha" header="Fecha" body={(rowData) => new Date(rowData.fecha).toLocaleDateString()} sortable />

                <Column 
                    field="descripcion" 
                    header="Descripción" 
                    sortable 
                    body={(rowData) => (
                        <div style={{maxWidth: "1500px", whiteSpace: "normal", wordBreak: "break-word", overflow: "hidden"}} >
                            {rowData.descripcion}
                        </div>
                    )}     
                />

                <Column header="Acciones" body={(rowData) => (
                    <>
                        <Button icon="pi pi-pencil" className="p-button-rounded p-button-text" onClick={() => openEditDialog(rowData)} />
                        <Button icon="pi pi-trash" className="p-button-rounded p-button-text p-button-danger" onClick={() => deleteCronica(rowData.id)} />
                        <Button icon="pi pi-print" className="p-button-rounded p-button-text p-button-success" onClick={() => handlePrint(rowData)} />
                    </>
                )} />
            </DataTable>

            <Dialog header={isEditing ? "Editar Crónica" : "Nueva Crónica"} style={{width: "800px"}} visible={visible} onHide={() => setVisible(false)}>
                <div className="p-fluid">
                    <div className="p-field">
                        <label style={{fontWeight: "bold", fontSize: "25px"}} htmlFor="descripcion">Descripción</label>
                        <InputTextarea style={{fontWeight: "bold", fontSize: "25px"}} id="descripcion" value={cronica.descripcion} onChange={(e) => setCronica({ ...cronica, descripcion: e.target.value })} rows={5} />
                    </div>
                    <div className="p-field">
                        <label style={{fontWeight: "bold", fontSize: "25px"}} htmlFor="fecha">Fecha</label>
                        <Calendar id="fecha" value={cronica.fecha} onChange={(e) => setCronica({ ...cronica, fecha: e.value })} placeholder="Seleccione una Fecha" locale="es" />
                    </div>
                    <div className="p-d-flex p-jc-end">
                        <Button label="Guardar" className="p-button-raised" onClick={saveCronica} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Cronicas;
